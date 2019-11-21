import {toValueString} from './Console';
import * as symbols from './symbols';
import {bytes as bytesSym, nativeObject as nativeObjectSym} from './symbols';

export function pick(object, keys) {
  const result = {};
  for (const key in object) {
    if (keys.includes(key)) {
      result[key] = object[key];
    }
  }
  return result;
}

export function omit(object, keys) {
  const result = {};
  for (const key in object) {
    if (!keys.includes(key)) {
      result[key] = object[key];
    }
  }
  return result;
}

export function isObject(value) {
  return value !== null && typeof value === 'object';
}

export function capitalizeFirstChar(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function normalizePath(path) {
  if (typeof path !== 'string') {
    throw new Error('must be a string');
  }
  if (path === '') {
    throw new Error('must not be empty');
  }
  const prefix = path.startsWith('/') ? '/' : '';
  const segments = [];
  const pathSegments = path.split('/');
  for (let i = 0; i < pathSegments.length; i++) {
    const segment = pathSegments[i];
    if (segment === '..') {
      const removed = segments.pop();
      if (!removed || removed === '.') {
        throw new Error('Path must not start with ".."');
      }
    } else if (segment !== '.' && segment !== '') {
      segments.push(segment);
    }
  }
  if (!segments.length) {
    return prefix || '.';
  }
  return prefix + segments.join('/');
}

export function normalizePathUrl(url) {
  if (typeof url !== 'string') {
    throw new Error('must be a string');
  }
  const parts = /^([a-z-]+:(\/\/)?)?(.*)/.exec(url);
  const schema = parts[1] || '';
  const content = parts[3] || '';
  if (schema === 'data:') {
    return url;
  }
  return schema + normalizePath(content);
}

export function dirname(path) {
  if (!path || path.slice(0, 1) !== '.') {
    return './';
  }
  return path.slice(0, path.lastIndexOf('/'));
}

/**
 * Check if a given value is a number and in closed range.
 * @param value Value to check.
 * @param range An array of min and max value of a closed range.
 * @param errorPrefix Prefix to prepend to messages of thrown errors.
 */
export function checkNumber(value, range = [-Infinity, Infinity], errorPrefix = undefined) {
  const prefix = errorPrefix ? errorPrefix + ': ' : '';
  if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
    throw new Error(`${prefix}Invalid number ${value}`);
  }
  if (value < range[0] || value > range[1]) {
    throw new Error(`${prefix}Number ${value} out of range`);
  }
}

/**
 * Boolean values indicates whether the trap must return true to avoid
 * exceptions if code is executed in strict mode. (Which is never desired.)
 */
const traps = {
  getPrototypeOf: false,
  setPrototypeOf: true,
  isExtensible: false,
  preventExtensions: false,
  getOwnPropertyDescriptor: false,
  defineProperty: true,
  has: false,
  get: false,
  set: true,
  deleteProperty: true,
  ownKeys: false,
  apply: false,
  construct: false
};

/**
 * @param {() => object} getTarget
 */
export function proxify(getTarget) {
  const handler = {};
  Object.keys(traps).forEach(trap => handler[trap] = (_, ...args) => {
    const result = Reflect[trap](getTarget(), ...args);
    return traps[trap] ? true : result;
  });
  return new Proxy({}, handler);
}

export function isReadable(value) {
  return value instanceof ArrayBuffer
    || ArrayBuffer.isView(value)
    || !!getBytes(value);
}

/**
 * @param {any} value
 * @return {ArrayBuffer}
 */
export function read(value) {
  if (value instanceof ArrayBuffer) {
    return value.slice(0);
  }
  if (ArrayBuffer.isView(value)) {
    return value.buffer.slice(0);
  }
  if (getBytes(value)) {
    return getBytes(value); // no copy needed since blobs are pseudo-immutable
  }
  throw new Error(`${typeof value} is not an ArrayBuffer, Blob or typed`);
}

/**
 * @param {any} blob
 * @returns {ArrayBuffer}
 */
export function getBytes(blob) {
  return blob[bytesSym];
}

/**
 * @param {any} blob
 * @param {ArrayBuffer} bytes
 */
export function setBytes(blob, bytes) {
  return blob[bytesSym] = bytes;
}

/**
 * @template {object} T
 * @template {keyof T} U
 * @param {object} target
 * @param {U[]} keys
 * @returns {Partial<Record<U, unknown>>}
 */
export function allowOnlyKeys(target, keys) {
  if (typeof target !== 'object') {
    throw new Error(toValueString(target) + ' is not an object');
  }
  for (const key in target) {
    if (keys.indexOf(/** @type {U} */(key)) === -1) {
      throw new Error(`${toValueString(target)} contains unexpected entry "${key}"`);
    }
  }
  return target;
}

/**
 * @template {any} T
 * @param {T} value
 * @param {any[]|undefined} allowed
 * @returns T
 */
export function allowOnlyValues(value, allowed, valueName = 'Value') {
  if (allowed && allowed.indexOf(value) === -1) {
    const expected = `"${allowed.slice(0, -1).join('", "')}" or "${allowed.slice(-1)}"`;
    throw new Error(`${valueName} must be ${expected}", got ${toValueString(value)}`);
  }
  return value;
}

/**
 * @param {object} object
 * @param {{cid: string}} nativeObject
 */
export function setNativeObject(object, nativeObject) {
  object[nativeObjectSym] = nativeObject;
}

/**
 * @param {object} object
 * @returns {{cid: string, isDisposed: () => boolean}}
 */
export function getNativeObject(object) {
  return object instanceof Object ? object[nativeObjectSym] : null;
}

/**
 * @param {Function} cb
 * @param {object=} target
 * @param {any[]=} args
 */
export function createNativeCallback(cb, target, args) {
  const stackTraceStack = [new Error().stack].concat(tabris._stackTraceStack);
  return function() {
    const oldStack = tabris._stackTraceStack;
    tabris._stackTraceStack = stackTraceStack;
    cb.apply(target ? target : global, args ? args : arguments);
    tabris.flush();
    tabris._stackTraceStack = oldStack;
  };
}

export function equals(a, b) {
  if (a === b) {
    return true;
  }
  if (a instanceof Object
    && b instanceof Object
    && a[symbols.equals] instanceof Function
    && b[symbols.equals] instanceof Function
    && (a[symbols.equals] === b[symbols.equals])
  ) {
    return a[symbols.equals](b);
  }
  if (a instanceof Object
    && a.constructor === Object
    && b instanceof Object
    && b.constructor === Object
  ) {
    const keysA = Reflect.ownKeys(a).sort();
    const keysB = Reflect.ownKeys(b).sort();
    return (keysA.length === keysB.length) && keysA.every((keyA, index) => {
      const keyB = keysB[index];
      return (keyA === keyB) && (a[keyA] === b[keyB]);
    });
  }
  if (a instanceof Array
    && a.constructor === Array
    && b instanceof Array
    && b.constructor === Array
  ) {
    return (a.length === b.length) && a.every((itemA, index) => itemA === b[index]);
  }
  return false;
}
