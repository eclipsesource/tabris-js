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
  let prefix = path.startsWith('/') ? '/' : '';
  let result = prefix + path.split(/\/+/).map((segment) => {
    if (segment === '..') {
      throw new Error("must not contain '..'");
    }
    return segment === '.' ? '' : segment;
  }).filter(string => !!string).join('/');
  return result ? result : '.';
}

export function normalizePathUrl(url) {
  if (typeof url !== 'string') {
    throw new Error('must be a string');
  }
  let parts = /^([a-z-]+:(\/\/)?)?(.*)/.exec(url);
  let schema = parts[1] || '';
  let content = parts[3] || '';
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

const bytesSym = Symbol();

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
