import File from './File';
import Blob from './Blob';

export default class FormData {

  getAll(name) {
    if (arguments.length === 0) {
      throw new TypeError(
        'FormData.getAll requires at least 1 argument, but only 0 were passed'
      );
    }
    const values = data(this)[name];
    return values ? values.concat() : [];
  }

  get(name) {
    if (arguments.length === 0) {
      throw new TypeError(
        'FormData.get requires at least 1 argument, but only 0 were passed'
      );
    }
    const values = data(this)[name];
    return values ? values[0] : null;
  }

  has(name) {
    if (arguments.length === 0) {
      throw new TypeError(
        'FormData.has requires at least 1 argument, but only 0 were passed'
      );
    }
    return !!data(this)[name];
  }

  append(name, value, filename) {
    if (arguments.length < 2) {
      throw new TypeError(
        arguments.length + ' is not a valid argument count for any overload of FormData.append.'
      );
    }
    if (arguments.length === 3 && !(value instanceof Blob)) {
      throw new TypeError('Argument 2 of FormData.append is not an object.');
    }
    const values = data(this)[name] || [];
    values.push(normalize(value, filename));
    data(this)[name] = values;
  }

  set(name, value, filename) {
    if (arguments.length < 2) {
      throw new TypeError(
        arguments.length + ' is not a valid argument count for any overload of FormData.set.'
      );
    }
    if (arguments.length === 3 && !(value instanceof Blob)) {
      throw new TypeError('Argument 2 of FormData.set is not an object.');
    }
    data(this)[name] = [normalize(value, filename)];
  }

  delete(name) {
    if (arguments.length === 0) {
      throw new TypeError(
        '0 is not a valid argument count for any overload of FormData.delete.'
      );
    }
    delete data(this)[name];
  }

  keys() {
    const entries = this.entries();
    const next = () => {
      const {done, value} = entries.next();
      return {done, value: !done ? value[0] : undefined};
    };
    return {next, [Symbol.iterator]() { return this; }};
  }

  values() {
    const entries = this.entries();
    const next = () => {
      const {done, value} = entries.next();
      return {done, value: !done ? value[1] : undefined};
    };
    return {next, [Symbol.iterator]() { return this; }};
  }

  [Symbol.iterator]() {
    return this.entries();
  }

  entries() {
    const keys = Object.keys(data(this)).sort();
    let i = 0;
    let j = 0;
    const next = () => {
      if (i < keys.length) {
        const values = data(this)[keys[i]];
        if (values && (j < values.length)) {
          return {done: false, value: [keys[i], values[j++]]};
        } else {
          i++;
          j = 0;
          return next();
        }
      }
      return {done: true, value: undefined};
    };
    return {next, [Symbol.iterator]() { return this; }};
  }

}

FormData.prototype[Symbol.toStringTag] = 'FormData';

/**
 * @param {FormData} formData
 * @returns {Blob}
 */
export function formDataToBlob(formData) {
  const boundary
    = '----tabrisformdataboundary-' + Math.round(Math.random() * 100000000) + '-yradnuobatadmrofsirbat';
  const parts = [];
  for (const [name, value] of formData) {
    parts.push(`--${boundary}\r\n`);
    if (value instanceof File) {
      parts.push(`Content-Disposition: form-data; name="${name}"; filename="${value.name}"\r\n`);
      parts.push(`Content-Type: ${value.type || 'application/octet-stream'}\r\n\r\n`);
      parts.push(value);
      parts.push('\r\n');
    } else {
      parts.push(`Content-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`);
    }
  }
  parts.push(`--${boundary}--`);
  return new Blob(parts, {type: 'multipart/form-data; boundary=' + boundary});
}

const dataKey = Symbol();

/**
 * @param {FormData} formData
 * @returns {{[name: string]: Array<string|File>}}
 */
function data(formData) {
  if (!formData[dataKey]) {
    formData[dataKey] = {};
  }
  return formData[dataKey];
}

function normalize(value, filename) {
  if (value instanceof File && filename === undefined) {
    return value;
  } else if (value instanceof Blob) {
    return new File([value], filename === undefined ? 'blob' : filename);
  }
  return value + '';
}
