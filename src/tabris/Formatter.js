/*
 * Implementation based on Node.js https://github.com/nodejs/node/
 *
 * Original work Copyright Copyright Joyent, Inc. and other Node contributors.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to permit
 * persons to whom the Software is furnished to do so, subject to the
 * following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
 * NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
 * USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
import {isPending, isRejected, getPromiseResult} from './Promise';
import {formatError} from './util-stacktrace';

const numbersOnlyRE = /^\d+$/;

const objectHasOwnProperty = Object.prototype.hasOwnProperty;
const propertyIsEnumerable = Object.prototype.propertyIsEnumerable;
const regExpToString = RegExp.prototype.toString;
const dateToISOString = Date.prototype.toISOString;

let CIRCULAR_ERROR_MESSAGE;

// TODO: Add support for Map, Set, MapIterator, SetIterator, DataView

function tryStringify(arg) {
  try {
    return JSON.stringify(arg);
  } catch (err) {
    // Populate the circular error message lazily
    if (!CIRCULAR_ERROR_MESSAGE) {
      try {
        const a = {}; a.a = a; JSON.stringify(a);
      } catch (innerErr) {
        CIRCULAR_ERROR_MESSAGE = innerErr.message;
      }
    }
    if (err.name === 'TypeError' && err.message === CIRCULAR_ERROR_MESSAGE) {
      return '[Circular]';
    }
    throw err;
  }
}

export function format(f) {
  if (typeof f !== 'string') {
    const objects = new Array(arguments.length);
    for (let index = 0; index < arguments.length; index++) {
      objects[index] = inspect(arguments[index]);
    }
    return objects.join(' ');
  }
  if (arguments.length === 1) {
    return f;
  }
  let str = '';
  let a = 1;
  let lastPos = 0;
  for (let i = 0; i < f.length;) {
    if (f.charCodeAt(i) === 37/* '%' */ && i + 1 < f.length) {
      if (f.charCodeAt(i + 1) !== 37/* '%' */ && a >= arguments.length) {
        ++i;
        continue;
      }
      switch (f.charCodeAt(i + 1)) {
        case 100: // 'd'
          if (lastPos < i) {
            str += f.slice(lastPos, i);
          }
          str += Number(arguments[a++]);
          break;
        case 105: // 'i'
          if (lastPos < i) {
            str += f.slice(lastPos, i);
          }
          str += parseInt(arguments[a++]);
          break;
        case 102: // 'f'
          if (lastPos < i) {
            str += f.slice(lastPos, i);
          }
          str += parseFloat(arguments[a++]);
          break;
        case 106: // 'j'
          if (lastPos < i) {
            str += f.slice(lastPos, i);
          }
          str += tryStringify(arguments[a++]);
          break;
        case 115: // 's'
          if (lastPos < i) {
            str += f.slice(lastPos, i);
          }
          str += String(arguments[a++]);
          break;
        case 37: // '%'
          if (lastPos < i) {
            str += f.slice(lastPos, i);
          }
          str += '%';
          break;
        default: // any other character is not a correct placeholder
          if (lastPos < i) {
            str += f.slice(lastPos, i);
          }
          str += '%';
          lastPos = i = i + 1;
          continue;
      }
      lastPos = i = i + 2;
      continue;
    }
    ++i;
  }
  if (lastPos === 0) {
    str = f;
  } else if (lastPos < f.length) {
    str += f.slice(lastPos);
  }
  while (a < arguments.length) {
    const x = arguments[a++];
    if (x === null || (typeof x !== 'object' && typeof x !== 'symbol')) {
      str += ` ${x}`;
    } else {
      str += ` ${inspect(x)}`;
    }
  }
  return str;
}

function inspect(obj) {
  // default options
  const ctx = {
    seen: [],
    breakLength: 60,
    maxArrayLength: 20
  };
  return formatValue(ctx, obj, 2);
}

function arrayToHash(array) {
  const hash = Object.create(null);
  for (let i = 0; i < array.length; i++) {
    const val = array[i];
    hash[val] = true;
  }
  return hash;
}

function formatValue(ctx, value, recurseTimes) {
  // Primitive types cannot have properties
  const primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  let keys = Object.keys(value);
  const visibleKeys = arrayToHash(keys);
  const symbolKeys = Object.getOwnPropertySymbols(value);
  const enumSymbolKeys = symbolKeys.filter((key) => propertyIsEnumerable.call(value, key));
  keys = keys.concat(enumSymbolKeys);

  // This could be a boxed primitive (new String(), etc.), check valueOf()
  // NOTE: Avoid calling `valueOf` on `Date` instance because it will return
  // a number which, when object has some additional user-stored `keys`,
  // will be printed out.
  let formatted;
  let raw = value;
  try {
    // the .valueOf() call can fail for a multitude of reasons
    if (!isDate(value)) {
      raw = value.valueOf();
    }
  } catch (e) {
    // ignore...
  }

  if (typeof raw === 'string') {
    // for boxed Strings, we have to remove the 0-n indexed entries,
    // since they just noisy up the output and are redundant
    keys = keys.filter((key) => {
      if (typeof key === 'symbol') {
        return true;
      }
      return !(key >= 0 && key < raw.length);
    });
  }

  // On iOS, errors have these extra enumerable fields
  if (isError(value) && tabris.device.platform === 'iOS') {
    keys = keys.filter((key) => !['line', 'column', 'sourceURL'].includes(key));
  }

  let constructor = getConstructorOf(value);

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (typeof value === 'function') {
      const ctorName = constructor ? constructor.name : 'Function';
      return `[${ctorName}${value.name ? `: ${value.name}` : ''}]`;
    }
    if (isRegExp(value)) {
      return regExpToString.call(value);
    }
    if (isDate(value)) {
      if (Number.isNaN(value.getTime())) {
        return value.toString();
      } else {
        return dateToISOString.call(value);
      }
    }
    if (isError(value)) {
      return formatError(value);
    }
    // now check the `raw` value to handle boxed primitives
    if (typeof raw === 'string') {
      formatted = formatPrimitive(ctx, raw);
      return `[String: ${formatted}]`;
    }
    if (typeof raw === 'symbol') {
      formatted = formatPrimitive(ctx, raw);
      return `[Symbol: ${formatted}]`;
    }
    if (typeof raw === 'number') {
      formatted = formatPrimitive(ctx, raw);
      return `[Number: ${formatted}]`;
    }
    if (typeof raw === 'boolean') {
      formatted = formatPrimitive(ctx, raw);
      return `[Boolean: ${formatted}]`;
    }
  }

  let base = '';
  let empty = false;
  let formatter = formatObject;
  let braces;

  // We can't compare constructors for various objects using a comparison like
  // `constructor === Array` because the object could have come from a different
  // context and thus the constructor won't match. Instead we check the
  // constructor names (including those up the prototype chain where needed) to
  // determine object types.
  if (Array.isArray(value)) {
    // Unset the constructor to prevent "Array [...]" for ordinary arrays.
    if (constructor && constructor.name === 'Array') {
      constructor = null;
    }
    braces = ['[', ']'];
    empty = value.length === 0;
    formatter = formatArray;
  } else if (isArrayBuffer(value)) {
    braces = ['{', '}'];
    keys.unshift('byteLength');
    visibleKeys.byteLength = true;
  } else if (isTypedArray(value)) {
    braces = ['[', ']'];
    formatter = formatTypedArray;
  } else if (isPromise(value)) {
    braces = ['{', '}'];
    formatter = formatPromise;
  } else {
    try {
      if (value instanceof Object && (value.toString !== Object.prototype.toString)) {
        const result = value.toString();
        if (typeof result === 'string') {
          return result;
        }
      }
    } catch (ex) {
      // try something else
    }
    // Unset the constructor to prevent "Object {...}" for ordinary objects.
    if (constructor && constructor.name === 'Object') {
      constructor = null;
    }
    braces = ['{', '}'];
    empty = true;  // No other data than keys.
  }

  empty = empty === true && keys.length === 0;

  // Make functions say that they are functions
  if (typeof value === 'function') {
    const ctorName = constructor ? constructor.name : 'Function';
    base = ` [${ctorName}${value.name ? `: ${value.name}` : ''}]`;
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ` ${regExpToString.call(value)}`;
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ` ${dateToISOString.call(value)}`;
  }

  // Make error with message first say the error
  if (isError(value)) {
    return formatError(value);
  }

  // Make boxed primitive Strings look like such
  if (typeof raw === 'string') {
    formatted = formatPrimitive(ctx, raw);
    base = ` [String: ${formatted}]`;
  }

  // Make boxed primitive Numbers look like such
  if (typeof raw === 'number') {
    formatted = formatPrimitive(ctx, raw);
    base = ` [Number: ${formatted}]`;
  }

  // Make boxed primitive Booleans look like such
  if (typeof raw === 'boolean') {
    formatted = formatPrimitive(ctx, raw);
    base = ` [Boolean: ${formatted}]`;
  }

  // Add constructor name if available
  if (base === '' && constructor) {
    braces[0] = `${constructor.name} ${braces[0]}`;
  }

  if (empty === true) {
    return `${braces[0]}${base}${braces[1]}`;
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return regExpToString.call(value);
    } else if (Array.isArray(value)) {
      return '[Array]';
    } else {
      return '[Object]';
    }
  }

  ctx.seen.push(value);
  const output = formatter(ctx, value, recurseTimes, visibleKeys, keys);
  ctx.seen.pop();
  return reduceToSingleString(output, base, braces, ctx.breakLength);
}

function formatNumber(ctx, value) {
  // Format -0 as '-0'. Strict equality won't distinguish 0 from -0.
  if (Object.is(value, -0)) {
    return '-0';
  }
  return `${value}`;
}

function formatPrimitive(ctx, value) {
  if (value === undefined) {
    return 'undefined';
  }
  // For some reason typeof null is "object", so special case here.
  if (value === null) {
    return 'null';
  }
  const type = typeof value;
  if (type === 'string') {
    const simple = JSON.stringify(value)
      .replace(/^"|"$/g, '')
      .replace(/'/g, '\\\'')
      .replace(/\\"/g, '"');
    return `'${simple}'`;
  }
  if (type === 'number') {
    return formatNumber(ctx, value);
  }
  if (type === 'boolean') {
    return `${value}`;
  }
  // es6 symbol primitive
  if (type === 'symbol') {
    return value.toString();
  }
}

function formatObject(ctx, value, recurseTimes, visibleKeys, keys) {
  return keys.map((key) => formatProperty(ctx, value, recurseTimes, visibleKeys, key, false));
}

function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  const output = [];
  let visibleLength = 0;
  let index = 0;
  while (index < value.length && visibleLength < ctx.maxArrayLength) {
    let emptyItems = 0;
    while (index < value.length && !hasOwnProperty(value, String(index))) {
      emptyItems++;
      index++;
    }
    if (emptyItems > 0) {
      const ending = emptyItems > 1 ? 's' : '';
      const message = `<${emptyItems} empty item${ending}>`;
      output.push(message);
    } else {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys, String(index), true));
      index++;
    }
    visibleLength++;
  }
  const remaining = value.length - index;
  if (remaining > 0) {
    output.push(`... ${remaining} more item${remaining > 1 ? 's' : ''}`);
  }
  for (let n = 0; n < keys.length; n++) {
    const key = keys[n];
    if (typeof key === 'symbol' || !numbersOnlyRE.test(key)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys, key, true));
    }
  }
  return output;
}

function formatTypedArray(ctx, value, recurseTimes, visibleKeys, keys) {
  const maxLength = Math.min(Math.max(0, ctx.maxArrayLength), value.length);
  const remaining = value.length - maxLength;
  const output = new Array(maxLength);
  for (let i = 0; i < maxLength; ++i) {
    output[i] = formatNumber(ctx, value[i]);
  }
  if (remaining > 0) {
    output.push(`... ${remaining} more item${remaining > 1 ? 's' : ''}`);
  }
  for (const key of keys) {
    if (typeof key === 'symbol' || !numbersOnlyRE.test(key)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys, key, true));
    }
  }
  return output;
}

function formatPromise(ctx, value, recurseTimes, visibleKeys, keys) {
  const output = [];
  if (isPending(value)) {
    output.push('<pending>');
  } else {
    const nextRecurseTimes = recurseTimes === null ? null : recurseTimes - 1;
    const result = getPromiseResult(value);
    const str = formatValue(ctx, result, nextRecurseTimes);
    if (isRejected(value)) {
      output.push(`<rejected> ${str}`);
    } else {
      output.push(str);
    }
  }
  for (let n = 0; n < keys.length; n++) {
    output.push(formatProperty(ctx, value, recurseTimes, visibleKeys, keys[n], false));
  }
  return output;
}

function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  let name, str;
  const desc = Object.getOwnPropertyDescriptor(value, key) || {value: value[key]};
  if (desc.get) {
    if (desc.set) {
      str = '[Getter/Setter]';
    } else {
      str = '[Getter]';
    }
  } else {
    if (desc.set) {
      str = '[Setter]';
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    if (typeof key === 'symbol') {
      name = `[${key.toString()}]`;
    } else {
      name = `[${key}]`;
    }
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (recurseTimes === null) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.replace(/\n/g, '\n  ');
        } else {
          str = str.replace(/^|\n/g, '\n   ');
        }
      }
    } else {
      str = '[Circular]';
    }
  }
  if (name === undefined) {
    if (array && numbersOnlyRE.test(key)) {
      return str;
    }
    name = JSON.stringify(`${key}`);
    if (/^"[a-zA-Z_][a-zA-Z_0-9]*"$/.test(name)) {
      name = name.substr(1, name.length - 2);
    } else {
      name = name.replace(/'/g, '\\\'')
        .replace(/\\"/g, '"')
        .replace(/^"|"$/g, '\'')
        .replace(/\\\\/g, '\\');
    }
  }
  return `${name}: ${str}`;
}

function reduceToSingleString(output, base, braces, breakLength) {
  const length = output.reduce((prev, cur) => prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1, 0);
  if (length > breakLength) {
    return braces[0] +
           // If the opening "brace" is too large, like in the case of "Set {",
           // we need to force the first item to be on the next line or the
           // items will not line up correctly.
           (base === '' && braces[0].length === 1 ? '' : `${base}\n `) +
           ` ${output.join(',\n  ')} ${braces[1]}`;
  }

  return `${braces[0]}${base} ${output.join(', ')} ${braces[1]}`;
}

function hasOwnProperty(obj, prop) {
  return objectHasOwnProperty.call(obj, prop);
}

function isError(value) {
  return objectToString(value) === '[object Error]' || value instanceof Error;
}

function isDate(value) {
  return objectToString(value) === '[object Date]' || value instanceof Date;
}

function isPromise(value) {
  return objectToString(value) === '[object Promise]' || value instanceof Promise;
}

function isRegExp(value) {
  return objectToString(value) === '[object RegExp]' || value instanceof RegExp;
}

const typedArrayTypes = [
  'Float32Array',
  'Float64Array',
  'Int8Array',
  'Int16Array',
  'Int32Array',
  'Uint8Array',
  'Uint8ClampedArray',
  'Uint16Array',
  'Uint32Array'
];
const typedArrayNames = {};
for (const type of typedArrayTypes) {
  typedArrayNames[`[object ${type}]`] = true;
}

function isTypedArray(value) {
  return typedArrayNames[objectToString(value)];
}

function isArrayBuffer(value) {
  return objectToString(value) === '[object ArrayBuffer]' || value instanceof ArrayBuffer;
}

function getConstructorOf(obj) {
  while (obj) {
    const descriptor = Object.getOwnPropertyDescriptor(obj, 'constructor');
    if (descriptor !== undefined && typeof descriptor.value === 'function' && descriptor.value.name !== '') {
      return descriptor.value;
    }
    obj = Object.getPrototypeOf(obj);
  }
  return null;
}

function objectToString(o) {
  return Object.prototype.toString.call(o);
}
