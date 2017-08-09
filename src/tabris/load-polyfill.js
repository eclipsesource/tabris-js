global.Promise = Promise;

if (typeof window === 'undefined') {
  global.window = global;
}

if (!Object.assign) {
  Object.defineProperty(Object, 'assign', {
    enumerable: false,
    configurable: true,
    writable: true,
    value: assign
  });
}

/**
 * Original code from
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
 */
function assign(target) {
  if (target === undefined || target === null) {
    throw new TypeError('Cannot convert first argument to object');
  }
  let to = Object(target);
  for (let i = 1; i < arguments.length; i++) {
    let source = arguments[i];
    if (source === undefined || source === null) {
      continue;
    }
    let keys = Object.keys(Object(source));
    for (let key of keys) {
      let desc = Object.getOwnPropertyDescriptor(source, key);
      if (desc !== undefined && desc.enumerable) {
        to[key] = source[key];
      }
    }
  }
  return to;
}
