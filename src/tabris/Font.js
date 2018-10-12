import {
  fontObjectToString,
  fontStringToObject,
  validateFamily,
  normalizeFamily,
  validateWeight,
  validateStyle,
  normalizeWeight,
  normalizeStyle
} from './util-fonts';

export default class Font {

  static isFontValue(value) {
    return value == null || value === 'initial' || Font.isValidFontValue(value);
  }

  static isValidFontValue(value) {
    try {
      Font.from(value);
      return true;
    } catch(ex) {
      return false;
    }
  }

  static from(value) {
    if (value instanceof Font) {
      return value;
    }
    if (value instanceof Object) {
      return fontLikeObjectToFontInstance(value);
    }
    if (typeof value === 'string') {
      return fontLikeObjectToFontInstance(fontStringToObject(value));
    }
    throw new Error('Not a valid FontValue: ' + value);
  }

  constructor(size, family = [], weight = 'normal', style = 'normal') {
    if (arguments.length < 1) {
      throw new Error('Not enough arguments');
    }
    setSize(this, size);
    setFamily(this, family);
    setWeight(this, weight);
    setStyle(this, style);
  }

  toString() {
    return fontObjectToString(this);
  }

}

function setFamily(font, family) {
  family.forEach(validateFamily);
  let value = Object.freeze(family.map(normalizeFamily));
  Object.defineProperty(font, 'family', {enumerable: true, value});
}

function setSize(font, value) {
  if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
    throw new Error(`Invalid number ${value}`);
  }
  if (value < 0) {
    throw new Error(`Number ${value} out of range`);
  }
  Object.defineProperty(font, 'size', {enumerable: true, value});
}

function setWeight(font, value) {
  validateWeight(value);
  Object.defineProperty(font, 'weight', {enumerable: true, value: normalizeWeight(value)});
}

function setStyle(font, value) {
  validateStyle(value);
  Object.defineProperty(font, 'style', {enumerable: true, value: normalizeStyle(value)});
}

function fontLikeObjectToFontInstance(value) {
  checkProperty(value, 'size');
  if ('family' in value) {
    if ('weight' in value) {
      if ('style' in value) {
        return new Font(value.size, value.family, value.weight, value.style);
      }
      return new Font(value.size, value.family, value.weight);
    }
    return new Font(value.size, value.family);
  }
  return new Font(value.size);
}

function checkProperty(object, prop) {
  if (!(prop in object)) {
    throw new Error(`Font-like object missing ${prop} value`);
  }
}
