import Widget from './Widget';
import WidgetCollection from './WidgetCollection';
import {omit} from './util';

export function createElement(jsxType, attributes, ...children) {
  let Type = typeToConstructor(jsxType);
  if (Type === WidgetCollection) {
    if (attributes) {
      throw new Error('JSX: WidgetCollection can not have attributes');
    }
    return new WidgetCollection(flattenChildren(children));
  }
  let result = new Type(getPropertiesMap(attributes || {}));
  if (!(result instanceof Widget)) {
    throw new Error(('JSX: Unsupported type ' + Type.name).trim());
  }
  result.on(getListenersMap(attributes || {}));
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

function getPropertiesMap(attributes) {
  return omit(attributes, Object.keys(attributes).filter(isEventAttribute));
}

function getListenersMap(attributes) {
  let listeners = {};
  for (let attribute in attributes) {
    if (isEventAttribute(attribute)) {
      let event = attribute[2].toLocaleLowerCase() + attribute.slice(3);
      listeners[event] = attributes[attribute];
    }
  }
  return listeners;
}

function isEventAttribute(attribute) {
  return attribute.startsWith('on') && attribute.charCodeAt(2) <= 90;
}
