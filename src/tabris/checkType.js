import {toValueString} from './Console';

/**
 * @template {any} T
 * @param {any} value
 * @param {Function} type
 * @param {any=} optionsOrCallback
 * @returns {T}
 */
export default function checkType(value, type, optionsOrCallback) {
  if (!type) {
    throw new TypeError('No type given');
  }
  if (isBoxedValue(value)) {
    throw new TypeError('Boxed values are forbidden');
  }
  const cb = optionsOrCallback instanceof Function ?  optionsOrCallback : null;
  /** @type {{nullable?: boolean, name?: string}} */
  const options = (!optionsOrCallback || cb) ? {} : optionsOrCallback;
  const name = options.name || toValueString(value);
  if (!isType(value, type, options.nullable)) {
    throw new TypeError(
      `Expected ${name} to be ${getTypeName(type)}, got ${getValueTypeName(value)}.`
    );
  }
  if (typeof value === 'number') {
    checkNumber(value, name);
  }
  if (cb) {
    cb(value);
    return;
  }
  return value;
}

/**
 * @template {any} T
 * @template {any} U
 * @param {U} value
 * @param {Function & {prototype: T}} type
 * @param {boolean} nullable
 * @returns {U is T}
 */
export function isType(value, type, nullable) {
  if (nullable && (value === null || value === undefined)) {
    return true;
  }
  if (value instanceof type || isPrimitiveOfType(value, type)) {
    return true;
  }
  return false;
}

/**
 * @param {Function} type
 * @returns {string}
 **/
export function getTypeName(type) {
  const name = type.name;
  if (name === 'Function') {
    return 'a function';
  }
  if (name === 'Object') {
    return 'an object';
  }
  if (name === 'Array') {
    return 'an array';
  }
  if (isPrimitiveType(type)) {
    return 'a ' + name.toLowerCase();
  }
  return 'of type ' + name;
}

/**
 * @param {any} value
 * @returns {string}
 **/
export function getValueTypeName(value) {
  if (value != null && isPrimitiveType(value.constructor)) {
    return value.constructor.name.toLowerCase();
  }
  if (value && value.constructor) {
    return value.constructor.name;
  }
  if (value === null) {
    return 'null';
  }
  return typeof value;
}

/**
 * @param {any} value
 * @param {Function} type
 * @returns {boolean}
 **/
function isPrimitiveOfType(value, type) {
  if (!isPrimitiveType(type)) {
    return false;
  }
  return typeof value === type.name.toLowerCase();
}

/**
 * @param {number} value
 * @param {string|undefined} name
 */
function checkNumber(value, name) {
  if (isNaN(value)) {
    throw new TypeError(`Expected ${name} to be a valid number, got ${toValueString(value)}.`);
  }
  if (!isFinite(value)) {
    throw new TypeError(`Expected ${name} to be a finite number, got ${toValueString(value)}.`);
  }
}

function isBoxedValue(value) {
  return value instanceof Boolean || value instanceof Number || value instanceof String;
}

/** @param {Function} type */
function isPrimitiveType(type) {
  return type === Boolean || type === Number || type === String;
}
