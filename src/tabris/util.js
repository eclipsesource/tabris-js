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
  let parts = /^([a-z\-]+:\/\/)?(.*)/.exec(url);
  let schema = parts[1] || '';
  let content = parts[2] || '';
  return schema + normalizePath(content);
}
