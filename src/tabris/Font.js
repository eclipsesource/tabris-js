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
import {checkNumber} from './util';
import {toValueString} from './Console';

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
    throw new Error(`${toValueString(value)} is not a valid FontValue`);
  }

  static get sansSerif() {
    return 'sans-serif';
  }

  static get serif() {
    return 'serif';
  }

  static get monospace() {
    return 'monospace';
  }

  static get condensed() {
    return 'condensed';
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

  equals(value) {
    if (!(value instanceof Font)) {
      return false;
    }
    return value.size === this.size
      && value.weight === this.weight
      && value.style === this.style
      && value.family.length === this.family.length
      && value.family.every((family, index) => this.family[index] === family);
  }

}

function setFamily(font, family) {
  family.forEach(validateFamily);
  const value = Object.freeze(family.map(normalizeFamily));
  Object.defineProperty(font, 'family', {enumerable: true, value});
}

function setSize(font, value) {
  checkNumber(value, [0, Infinity], 'Invalid font size');
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
  return new Font(
    value.size,
    value.family || [],
    value.weight || 'normal',
    value.style || 'normal'
  );
}

function checkProperty(object, prop) {
  if (!(prop in object)) {
    throw new Error(`Font-like object missing ${prop} value`);
  }
}
