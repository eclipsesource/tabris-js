import Widget from './Widget';
import Styles from './Styles';
import Component from './Component';
import WidgetCollection from './WidgetCollection';
import Data from './Data';

const _myProps = ["append", "destroy"];

export function createElement(jsxType, properties, ...children) {
  properties = properties || {};
  children = children || [];
  children = flattenChildren(children);
  let Type = typeToConstructor(jsxType);
  if (Type === WidgetCollection) {
    if (properties) {
      throw new Error('JSX: WidgetCollection can not have attributes');
    }
    return new WidgetCollection(flattenChildren(children));
  }
  let on = {}, once = {}, style, props = {};
  for (let ev in properties) {
    if (ev.indexOf('once-') > -1) {
      once[ev.substr(5)] = properties[ev].bind(result);
      delete properties[ev];
    } else if (ev.indexOf('on-') > -1) {
      on[ev.substr(3)] = properties[ev].bind(result);
      delete properties[ev];
    } else if (ev === 'style') {
      style = Styles(properties[ev]);
      delete properties[ev];
    } else if (Type[ev] && _myProps.indexOf(ev) !== -1) {
		props[ev] = properties[ev];
		delete properties[ev];
	}
  }
  let isFunc = typeof(Type) === "function";
  let result = isFunc ? new Type(properties) : Type;
  for (let ev in props) {
	if (typeof result[ev] === "function" && props[ev] !== undefined) {
    result[ev](props[ev]);
	}
  }
  for (let ev in on) {
    result.on(ev, on[ev]);
  }
  for (let ev in once) {
    result.once(ev, once[ev]);
  }
  if (style) {
    result.set(style);
  }
  if (!isFunc) {
	  return;
  }
  if (!(result instanceof Widget)) {
    throw new Error(('JSX: Unsupported type ' + Type.name).trim());
	return;
  }
  if (result instanceof Component) {
	result.state = result.state instanceof Data ? result.state : new Data(result.state);
	result.props = result.props instanceof Data ? result.props : new Data(result.props);
	result.children = children;
		result.rendered = result.render.call(result, result.props, result.state);
	if (result.rendered !== undefined && result.componentDidMount) {
		result.componentDidMount.call(result, result.props, result.state);
	}
	result = result.rendered;
  }
  return result.append.apply(result, children);
}

function typeToConstructor(jsxType) {
  if (jsxType instanceof Function) {
    return jsxType;
  } else if (global.tabris.ui[jsxType] !== undefined) {
	return global.tabris.ui[jsxType];
  } else if (global.tabris[jsxType] !== undefined) {
	  return global.tabris[jsxType];
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