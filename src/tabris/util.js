export function extend(target) {
  for (let i = 1; i < arguments.length; i++) {
    let source = arguments[i];
    for (let name in source) {
      target[name] = source[name];
    }
  }
  return target;
}

export function pick(object, keys) {
  let result = {};
  for (let key in object) {
    if (keys.includes(key)) {
      result[key] = object[key];
    }
  }
  return result;
}

export function omit(object, keys) {
  let result = {};
  for (let key in object) {
    if (!keys.includes(key)) {
      result[key] = object[key];
    }
  }
  return result;
}

export function clone(object) {
  let result = {};
  for (let key in object) {
    result[key] = object[key];
  }
  return result;
}

export function extendPrototype(fn, target) {
  let Helper = function() {};
  Helper.prototype = fn.prototype;
  return extend(new Helper(), target);
}
