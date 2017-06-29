import Widget from './Widget';
import WidgetCollection from './WidgetCollection';

export function createElement(jsxType, properties, ...children) {
  let Type = typeToConstructor(jsxType);
  if (Type === WidgetCollection) {
    if (properties) {
      throw new Error('JSX: WidgetCollection can not have attributes');
    }
    return new WidgetCollection(flattenChildren(children));
  }
  let result = new Type(properties || {});
  if (!(result instanceof Widget)) {
    throw new Error(('JSX: Unsupported type ' + Type.name).trim());
  }
  return result.append.apply(result, flattenChildren(children));
}

function typeToConstructor(jsxType) {
  if (jsxType instanceof Function) {
    return jsxType;
  }
  let typeName = jsxType.charAt(0).toUpperCase() + jsxType.slice(1);
  let Type =  global.tabris[typeName];
  if (!(Type instanceof Function)) {
    throw new Error(('JSX: Unsupported type ' + jsxType).trim());
  }
  return Type;
}

function flattenChildren(children) {
  let result = [];
  for (let child of children) {
    if (child instanceof WidgetCollection) {
      result = result.concat(flattenChildren(child.toArray()));
    } else {
      result.push(child);
    }
  }
  return result;
}
