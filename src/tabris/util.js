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
