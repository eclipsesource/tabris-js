import Widget from './Widget';

export function createElement(jsxType, properties, ...children) {
  let Type = typeToConstructor(jsxType);
  let on = {}, once = {};
  for (let ev in properties) {
    if (ev.indexOf('once-') > -1) {
      once[ev.substr(5)] = properties[ev];
      delete properties[ev];
    } else if (ev.indexOf('on-') > -1) {
      on[ev.substr(3)] = properties[ev];
      delete properties[ev];
    }
  }
  let result = new Type(properties);
  if (!(result instanceof Widget)) {
    throw new Error(('JSX: Unsupported type ' + Type.name).trim());
  }
  for (let ev in on) {
    result.on(ev, on[ev]);
  }
  for (let ev in once) {
    result.once(ev, once[ev]);
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
