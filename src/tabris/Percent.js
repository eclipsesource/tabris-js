import {checkNumber} from './util';

export default class Percent {

  static isValidPercentValue(value) {
    try {
      Percent.from(value);
      return true;
    } catch(ex) {
      return false;
    }
  }

  static from(value) {
    if (value instanceof Percent) {
      return value;
    }
    if (value instanceof Object) {
      return percentLikeObjectToPercentInstance(value);
    }
    if (typeof value === 'string') {
      checkPercentString(value);
      return new Percent(percentNumberFromString(value));
    }
    throw new Error('Not a valid PercentValue: ' + value);
  }

  constructor(percent) {
    if (arguments.length < 1) {
      throw new Error('Not enough arguments');
    }
    checkNumber(percent, [0, 100], 'Invalid Percent');
    Object.defineProperty(this, 'percent', {value: percent});
  }

  toString() {
    return `${this.percent}%`;
  }

  valueOf() {
    return this.percent;
  }
}

function percentLikeObjectToPercentInstance(value) {
  checkProperty(value, 'percent');
  return new Percent(value.percent);
}

function checkPercentString(value) {
  if (!/%$/.test(value) || isNaN(percentNumberFromString(value))) {
    throw new Error('Invalid percent string ' + value + ': It must be a number followed by "%".');
  }
  checkNumber(percentNumberFromString(value), [0, 100], `Invalid percent string ${value}`);
}

function percentNumberFromString(value) {
  return parseInt(value.replace(/%$/, ''));
}

function checkProperty(object, prop) {
  if (!(prop in object)) {
    throw new Error(`Percent-like object missing ${prop} value`);
  }
}
