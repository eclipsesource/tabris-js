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

export function drop(array, index) {
  return Array.prototype.slice.call(array, arguments.length > 1 ? index : 1);
}

export function clone(object) {
  let result = {};
  for (let key in object) {
    result[key] = object[key];
  }
  return result;
}

export function rename(object, mapping) {
  let result = {};
  for (let key in object) {
    result[mapping[key] || key] = object[key];
  }
  return result;
}

export function invert(object) {
  let result = {};
  for (let key in object) {
    result[object[key]] = key;
  }
  return result;
}

export function extendPrototype(fn, target) {
  let Helper = function() {};
  Helper.prototype = fn.prototype;
  return extend(new Helper(), target, {
    '_super'(method, params) {
      return fn.prototype[method].apply(this, params);
    }
  });
}
