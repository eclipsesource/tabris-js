const FONT_STYLES = ['italic', 'normal'];
const FONT_WEIGHTS = ['black', 'bold', 'medium', 'thin', 'light', 'normal'];

export function fontStringToObject(str) {
  let result = {family: [], size: 0, style: 'normal', weight: 'normal'};
  let parts = str.split(/(?:\s|^)\d+px(?:\s|$)/);
  checkTruthy(parts.length === 2, 'Invalid font syntax');
  let [sizePrefix, sizeSuffix] = parts;
  result.size = parseInt(/(?:\s|^)(\d+)px(?:\s|$)/.exec(str)[1], 10);
  parseSizePrefix(result, sizePrefix);
  parseFamily(result, sizeSuffix);
  return result;
}

export function fontObjectToString(font) {
  return [
    font.style === 'normal' ? '' : font.style,
    font.weight === 'normal' ? '' : font.weight,
    font.size + 'px',
    font.family.join(', ')
  ].filter(str => !!str).join(' ').trim();
}

export function validateFamily(name) {
  let valid = /(?:^\s*[^"']+\s*$)|(?:^\s*"[^"']+"\s*$)|(?:^\s*'[^"']+'\s*$)/.exec(name);
  checkTruthy(valid, 'Invalid font family: ' + name);
}

export function validateStyle(style) {
  checkTruthy(isStyle(style), `Invalid font style ${style}`);
}

export function validateWeight(weight) {
  checkTruthy(isWeight(weight), `Invalid font weight ${weight}`);
}

export function normalizeFamily(value) {
  return /^\s*["']?([^"']*)/.exec(value)[1].trim();
}

export function normalizeWeight(value) {
  return value.trim();
}

export function normalizeStyle(value) {
  return value.trim();
}

function parseSizePrefix(fontObj, prefix) {
  let prefixes = prefix.trim().split(/\s+/);
  checkTruthy(prefixes.length <= 2, 'Too many font size prefixes');
  let {style, weight} = parseSizePrefixes(prefixes);
  fontObj.style = style;
  fontObj.weight = weight;
}

function parseSizePrefixes(prefixes) {
  // [styleOrWeight]
  // [style, weight]
  if (prefixes.length === 1) {
    let prefix = prefixes[0];
    if (isStyle(prefix)) {
      return {weight: 'normal', style: normalizeStyle(prefix)};
    } else if (isWeight(prefix)) {
      return {weight: normalizeWeight(prefix), style: 'normal'};
    } else if (prefix === 'normal' || prefix === '') {
      return {style: 'normal', weight: 'normal'};
    }
    throw new Error(`Invalid font style or weight ${prefix}`);
  } else if (prefixes.length === 2) {
    validateStyle(prefixes[0]);
    validateWeight(prefixes[1]);
    return {style: normalizeStyle(prefixes[0]), weight: normalizeWeight(prefixes[1])};
  }
}

function isStyle(value) {
  return typeof value === 'string' && FONT_STYLES.includes(value.trim());
}

function isWeight(value) {
  return typeof value === 'string' && FONT_WEIGHTS.includes(value.trim());
}

function parseFamily(fontArr, family) {
  // NOTE: Currently family is optional to allow for default fonts, but this is
  //       not CSS font syntax. See https://github.com/eclipsesource/tabris-js/issues/24
  (family ? family.split(',') : []).forEach((name) => {
    validateFamily(name);
    fontArr.family.push(normalizeFamily(name));
  });
}

function checkTruthy(value, message) {
  if (!value) {
    throw new Error(message);
  }
}
