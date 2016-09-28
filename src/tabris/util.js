export function extend(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];
    for (var name in source) {
      target[name] = source[name];
    }
  }
  return target;
}

export function pick(object, keys) {
  var result = {};
  for (var key in object) {
    if (keys.indexOf(key) !== -1) {
      result[key] = object[key];
    }
  }
  return result;
}

export function omit(object, keys) {
  var result = {};
  for (var key in object) {
    if (keys.indexOf(key) === -1) {
      result[key] = object[key];
    }
  }
  return result;
}

export function drop(array, index) {
  return Array.prototype.slice.call(array, arguments.length > 1 ? index : 1);
}

export function clone(object) {
  var result = {};
  for (var key in object) {
    result[key] = object[key];
  }
  return result;
}

export function rename(object, mapping) {
  var result = {};
  for (var key in object) {
    result[mapping[key] || key] = object[key];
  }
  return result;
}

export function invert(object) {
  var result = {};
  for (var key in object) {
    result[object[key]] = key;
  }
  return result;
}

export function extendPrototype(fn, target) {
  var Helper = function() {};
  Helper.prototype = fn.prototype;
  return extend(new Helper(), target, {
    '_super': function(method, params) {
      return fn.prototype[method].apply(this, params);
    }
  });
}
