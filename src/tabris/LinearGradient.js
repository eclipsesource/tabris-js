import {checkNumber} from './util';
import Color from './Color';
import Percent from './Percent';

const SIDES = ['left', 'top', 'right', 'bottom'];

export default class LinearGradient {

  static isLinearGradientValue(value) {
    return value == null || value === 'initial' || LinearGradient.isValidLinearGradientValue(value);
  }

  static isValidLinearGradientValue(value) {
    try {
      LinearGradient.from(value);
      return true;
    } catch(ex) {
      return false;
    }
  }

  static from(value) {
    if (value instanceof LinearGradient) {
      return value;
    }
    if (value instanceof Object) {
      return gradientLikeObjectToGradientInstance(value);
    }
    if (typeof value === 'string') {
      return gradientLikeObjectToGradientInstance(gradientStringToObject(value));
    }
    throw new Error('Not a valid LinearGradient: ' + value);
  }

  constructor(colorStops, direction) {
    if (arguments.length < 1) {
      throw new Error('Not enough arguments');
    }
    let directionDegrees = 180;
    if (arguments.length > 1) {
      checkNumber(direction, [-Infinity, Infinity], 'Invalid direction angle');
      directionDegrees = direction;
    }
    checkColorStops(colorStops);
    Object.defineProperty(this, 'colorStops', {enumerable: true, value: Object.freeze(colorStops)});
    Object.defineProperty(this, 'direction', {enumerable: true, value: directionDegrees});
  }

  toString() {
    const directionPart = this.direction ? this.direction + 'deg, ' : '';
    const colorStopsPart = this.colorStops.join(', ');
    return `linear-gradient(${directionPart}${colorStopsPart})`;
  }

}

function gradientStringToObject(css) {
  let gradient = css.trim();
  const result = {colorStops: []};
  if (gradient.indexOf('linear-gradient') !== 0) {
    throw new Error('Argument is not a valid linear gradient definition');
  }
  gradient = gradient.substring(15).trim();
  if (gradient.indexOf('(') !== 0 && gradient.lastIndexOf(')') !== gradient.length - 1) {
    throw new Error('Argument is not a valid linear gradient definition');
  }
  gradient = gradient.substring(1, gradient.length - 1).trim();
  gradient = encodeRGBColors(gradient);
  const gradientParts = gradient.split(',');
  // starting point
  let startingPoint = gradientParts[0].trim();
  let colorStopPartIndex = 1;
  if (startingPoint.indexOf('to') === 0) {
    startingPoint = startingPoint.substring(3).trim();
    checkSide(startingPoint);
    result.direction = directionToDegrees(startingPoint);
  } else if (startingPoint.indexOf('deg') === startingPoint.length - 3) {
    result.direction = parseInt(startingPoint.substring(0, startingPoint.length - 3), 10);
  } else {
    colorStopPartIndex = 0;
  }
  // color stop
  for (let i = colorStopPartIndex; i < gradientParts.length; i++) {
    const colorStopParts = gradientParts[i].trim().split(' ');
    if (colorStopParts.length === 1 && colorStopParts[0] !== '') {
      const color = decodeRGBColor(colorStopParts[0]);
      result.colorStops.push(color);
    } else if (colorStopParts.length === 2) {
      const color = decodeRGBColor(colorStopParts[0]);
      const offset = colorStopParts[1];
      result.colorStops.push([color, offset]);
    } else {
      throw new Error('Invalid color stop value');
    }
  }
  return result;
}

function encodeRGBColors(gradient) {
  let result = '';
  let escaping = false;
  for (let i = 0; i < gradient.length; i++) {
    if (result.endsWith('rgb')) {
      escaping = true;
    }
    if (escaping && result.endsWith(')')) {
      escaping = false;
    }
    const currentChar = gradient.charAt(i);
    if (escaping) {
      if (currentChar === ',') {
        result += '&#44';
      } else if (currentChar !== ' ') {
        result += currentChar;
      }
    } else {
      result += currentChar;
    }
  }
  return result;
}

function decodeRGBColor(color) {
  return color.replace(/&#44/g, ',');
}

function gradientLikeObjectToGradientInstance(value) {
  checkProperty(value, 'colorStops');
  if ('direction' in value) {
    let {direction} = value;
    if (typeof direction === 'string') {
      checkSide(direction);
      direction = directionToDegrees(direction);
    }
    return new LinearGradient(value.colorStops.map(translateGradientLikeColorStop), direction);
  }
  return new LinearGradient(value.colorStops.map(translateGradientLikeColorStop));
}

function translateGradientLikeColorStop(stop) {
  if (Color.isValidColorValue(stop)) {
    return Color.from(stop);
  }
  if (stop instanceof Array) {
    if (stop.length !== 2) {
      throwInvalidGradientLikeColorStop(stop);
    }
    return [Color.from(stop[0]), Percent.from(stop[1])];
  }
  throwInvalidGradientLikeColorStop(stop);
}

function checkProperty(object, prop) {
  if (!(prop in object)) {
    throw new Error(`LinearGradient-like object missing ${prop} value`);
  }
}

function directionToDegrees(direction) {
  return {left: 270, top: 0, right: 90, bottom: 180}[direction];
}

function checkColorStops(colorStops) {
  if (!(colorStops instanceof Array)) {
    throw new Error('colorStops must be an array');
  }
  if (colorStops.length <= 0) {
    throw new Error('colorStops must not be empty');
  }
  colorStops.forEach(checkColorStop);
}

function checkColorStop(colorStop) {
  if (!(colorStop instanceof Array) && !(colorStop instanceof Color)) {
    throwInvalidColorStop(colorStop);
  }
  if (colorStop instanceof Array) {
    if (
      colorStop.length !== 2 ||
      !(colorStop[0] instanceof Color) ||
      !(colorStop[1] instanceof Percent)
    ) {
      throwInvalidColorStop(colorStop);
    }
  }
}

function throwInvalidColorStop(colorStop) {
  throw new Error('Invalid color stop: ' + JSON.stringify(colorStop) + '. ' +
    'It must be either [Color, Percent] or Color.');
}

function throwInvalidGradientLikeColorStop(colorStop) {
  throw new Error(
    'Invalid color stop: ' + JSON.stringify(colorStop) +
    '. It must be either [ColorValue, Percent] or ColorValue.'
  );
}

function checkSide(value) {
  if (value.indexOf(' ') > -1) {
    throw new Error(`Invalid direction "${value}". Corners are not supported.`);
  }
  if (!SIDES.includes(value)) {
    throw new Error(`Invalid direction side "${value}". Must be a side (e.g. "left") or a corner (e.g. "left top").`);
  }
}
