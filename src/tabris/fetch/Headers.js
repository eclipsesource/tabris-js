/**
 * Original work Copyright (c) 2014-2016 GitHub, Inc.
 * Implementation based on https://github.com/github/fetch
 */
export default class Headers {

  constructor(headers) {
    this.$map = {};
    if (headers instanceof Headers) {
      headers.forEach((value, name) => this.append(name, value));
    } else if (Array.isArray(headers)) {
      headers.forEach(header => this.append(header[0], header[1]));
    } else if (headers) {
      Object.getOwnPropertyNames(headers).forEach(name => this.append(name, headers[name]));
    }
  }

  append(name, value) {
    name = normalizeName(name);
    let oldValue = this.$map[name];
    this.$map[name] = oldValue ? oldValue + ',' + value : '' + value;
  }

  delete(name) {
    delete this.$map[normalizeName(name)];
  }

  get(name) {
    name = normalizeName(name);
    return this.has(name) ? this.$map[name] : null;
  }

  has(name) {
    return this.$map.hasOwnProperty(normalizeName(name));
  }

  set(name, value) {
    this.$map[normalizeName(name)] = '' + value;
  }

  forEach(callback, thisArg) {
    for (let name in this.$map) {
      if (this.$map.hasOwnProperty(name)) {
        callback.call(thisArg, this.$map[name], name, this);
      }
    }
  }

  keys() {
    let items = [];
    this.forEach((value, name) => items.push(name));
    return iteratorFor(items);
  }

  values() {
    let items = [];
    this.forEach(value => items.push(value));
    return iteratorFor(items);
  }

  entries() {
    let items = [];
    this.forEach((value, name) => items.push([name, value]));
    return iteratorFor(items);
  }

  [iteratorSymbol()]() {
    return this.entries();
  }

}

function normalizeName(name) {
  name = '' + name;
  if (/[^a-z0-9\-#$%&'*+.^_`|~]/i.test(name)) {
    throw new TypeError('Invalid character in header field name');
  }
  return name.toLowerCase();
}

function iteratorFor(items) {
  let iterator = {
    next() {
      let value = items.shift();
      return {done: value === undefined, value};
    }
  };
  iterator[iteratorSymbol()] = function() {
    return iterator;
  };
  return iterator;
}

// TODO replace when ES6 iterator is available on all platforms
function iteratorSymbol() {
  return 'Symbol' in global && 'iterator' in global.Symbol ? global.Symbol.iterator : '@@iterator';
}
