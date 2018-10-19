import {colorStringToArray, NAMES} from './util-colors';
import {checkNumber} from './util';

export default class Color {

  static isColorValue(value) {
    return value == null || value === 'initial' || Color.isValidColorValue(value);
  }

  static isValidColorValue(value) {
    try {
      Color.from(value);
      return true;
    } catch(ex) {
      return false;
    }
  }

  static from(value) {
    if (value instanceof Color) {
      return value;
    }
    if (value instanceof Array) {
      return arrayToColorInstance(value);
    }
    if (value instanceof Object) {
      return colorLikeObjectToColorInstance(value);
    }
    if (typeof value === 'string') {
      return arrayToColorInstance(colorStringToArray(value));
    }
    throw new Error('Not a valid ColorValue: ' + value);
  }

  constructor(red, green, blue, alpha = 255) {
    if (arguments.length > 4) {
      throw new Error('Too many arguments');
    }
    if (arguments.length < 3) {
      throw new Error('Not enough arguments');
    }
    setChannel(this, 'red', red);
    setChannel(this, 'green', green);
    setChannel(this, 'blue', blue);
    setChannel(this, 'alpha', alpha);
  }

  toString() {
    if (this.alpha === 255) {
      return `rgb(${this.red}, ${this.green}, ${this.blue})`;
    }
    return `rgba(${this.red}, ${this.green}, ${this.blue}, ${Math.round(this.alpha * 100 / 255) / 100})`;
  }

  toArray() {
    return [this.red, this.green, this.blue, this.alpha];
  }

}

Object.keys(NAMES).forEach(name => {
  Object.defineProperty(Color, name, {value: Color.from(NAMES[name])});
});

function setChannel(color, channel, value) {
  checkNumber(value, [0, 255]);
  Object.defineProperty(color, channel, {enumerable: true, value: Math.round(value)});
}

function colorLikeObjectToColorInstance(value) {
  checkProperty(value, 'red');
  checkProperty(value, 'green');
  checkProperty(value, 'blue');
  if ('alpha' in value) {
    return new Color(value. red, value. green, value.blue, value.alpha);
  }
  return new Color(value. red, value. green, value.blue);
}

function arrayToColorInstance(value) {
  if (value.length < 3) {
    throw new Error('Color array too short');
  }
  if (value.length > 4) {
    throw new Error('Color array too long');
  }
  return new Color(value[0], value[1], value[2], value.length === 4 ? value[3] : 255);
}

function checkProperty(object, prop) {
  if (!(prop in object)) {
    throw new Error(`Color-like object missing ${prop} value`);
  }
}
