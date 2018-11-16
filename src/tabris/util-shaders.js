import {colorStringToArray} from './util-colors';

class Shader {
  constructor(type) {
    this.type = type;
  }
}

export class LinearGradientShader extends Shader {

  constructor(css) {
    super('linearGradient');
    this.angle = 180;
    this.colors = [];
    if (typeof css !== 'string') {
      throw new Error('Argument is not a string');
    }
    this.css = css;
    this._parse(css);
  }

  _parse(css) {
    let gradient = css.trim();
    if (gradient.indexOf('linear-gradient') !== 0) {
      throw new Error('Argument is not a valid linear gradient definition');
    }
    gradient = gradient.substring(15).trim();
    if (gradient.indexOf('(') !== 0 && gradient.lastIndexOf(')') !== gradient.length - 1) {
      throw new Error('Argument is not a valid linear gradient definition');
    }
    gradient = gradient.substring(1, gradient.length - 1).trim();
    gradient = this._escapeRGBColors(gradient);
    const gradientParts = gradient.split(',');
    // starting point
    let startingPoint = gradientParts[0].trim();
    let colorStopPartIndex = 1;
    if (startingPoint.indexOf('to') === 0) {
      startingPoint = startingPoint.substring(3).trim();
      this.angle = this._readSideOrCorner(startingPoint);
    } else if (startingPoint.indexOf('deg') === startingPoint.length - 3) {
      this.angle = parseInt(startingPoint.substring(0, startingPoint.length - 3), 10);
    } else {
      colorStopPartIndex = 0;
    }
    // color stop
    for (let i = colorStopPartIndex; i < gradientParts.length; i++) {
      const colorStopParts = gradientParts[i].trim().split(' ');
      if (colorStopParts.length === 1) {
        this.colors.push([this._readColor(colorStopParts[0]), null]);
      } else if (colorStopParts.length === 2) {
        const color = this._readColor(colorStopParts[0]);
        const percent = this._readPercent(colorStopParts[1]);
        this.colors.push([color, percent]);
      } else {
        throw new Error('Invalid color stop value');
      }
    }
  }

  _readSideOrCorner(sedeOrCorner) {
    switch (sedeOrCorner) {
      case 'top':
        return 0;
      case 'right':
        return 90;
      case 'bottom':
        return 180;
      case 'left':
        return 270;
      case 'left top':
        return 315;
      case 'left bottom':
        return 225;
      case 'right top':
        return 45;
      case 'right bottom':
        return 135;
    }
  }

  _readPercent(percent) {
    if (percent.indexOf('%') === -1) {
      throw new Error('Invalid color stop percentage');
    }
    return parseFloat(percent.replace('%', '').trim() / 100);
  }

  _readColor(color) {
    return colorStringToArray(color.replace(/&#44/g, ','));
  }

  _escapeRGBColors(gradient) {
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

}
