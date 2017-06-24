import Widget from './Widget';
import Styles from './Styles';
import Component from './Component';

export function createElement(jsxType, properties, ...children) {
  let Type = typeToConstructor(jsxType);
  let on = {}, once = {}, style;
  for (let ev in properties) {
    if (ev.indexOf('once-') > -1) {
      once[ev.substr(5)] = properties[ev];
      delete properties[ev];
    } else if (ev.indexOf('on-') > -1) {
      on[ev.substr(3)] = properties[ev];
      delete properties[ev];
    } else if (ev === 'style') {
      style = Styles(properties[ev]);
      delete properties[ev];
    }
  }
  let result = new Type(properties);
  for (let ev in on) {
    result.on(ev, on[ev]);
  }
  for (let ev in once) {
    result.once(ev, once[ev]);
  }
  if (style) {
    result.set(style);
  }
  if (!(result instanceof Widget)) {
    throw new Error(('JSX: Unsupported type ' + Type.name).trim());
	return;
  }
  if (result instanceof Component) {
	result = result.render(result.props, result.state);
  }
  return result.append.apply(result, children);
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
