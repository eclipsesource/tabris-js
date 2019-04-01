import * as ConstraintExports from './Constraint'; // work around circular dependency
import {checkIsValidSiblingReference, referenceToString, normalizeNumber, normalizeReference} from './Constraint';
import {checkNumber} from './util';

export default class LayoutData {

  static get next() {
    return ConstraintExports.default.next;
  }

  static get prev() {
    return ConstraintExports.default.prev;
  }

  static get stretch() {
    if (!this._stretch) {
      this._stretch = new LayoutData({
        left: ConstraintExports.zero,
        top: ConstraintExports.zero,
        right: ConstraintExports.zero,
        bottom: ConstraintExports.zero
      });
    }
    return this._stretch;
  }

  static get stretchX() {
    if (!this._stretchX) {
      this._stretchX = new LayoutData({
        left: ConstraintExports.zero,
        right: ConstraintExports.zero,
      });
    }
    return this._stretchX;
  }

  static get stretchY() {
    if (!this._stretchY) {
      this._stretchY = new LayoutData({
        top: ConstraintExports.zero,
        bottom: ConstraintExports.zero
      });
    }
    return this._stretchY;
  }

  static get center() {
    if (!this._center) {
      this._center = new LayoutData({centerX: 0, centerY: 0});
    }
    return this._center;
  }

  static from(value) {
    if (value === 'stretch')  {
      return LayoutData.stretch;
    }
    if (value === 'stretchX')  {
      return LayoutData.stretchX;
    }
    if (value === 'stretchY')  {
      return LayoutData.stretchY;
    }
    if (value === 'center')  {
      return LayoutData.center;
    }
    if (!(value instanceof Object)) {
      throw new Error('Not an object: ' + typeof value);
    }
    if (value instanceof LayoutData) {
      return value;
    }
    if (value.constructor !== Object) {
      throw new Error('Not a parameter object: ' + value.constructor.name);
    }
    return new LayoutData({
      left: has(value, 'left') ? ConstraintExports.default.from(value.left) : 'auto',
      right: has(value, 'right') ? ConstraintExports.default.from(value.right) : 'auto',
      top: has(value, 'top') ? ConstraintExports.default.from(value.top) : 'auto',
      bottom: has(value, 'bottom') ? ConstraintExports.default.from(value.bottom) : 'auto',
      centerX: has(value, 'centerX') ? normalizeNumber(value.centerX, 0) : 'auto',
      centerY: has(value, 'centerY') ? normalizeNumber(value.centerY, 0) : 'auto',
      baseline: has(value, 'baseline') ? normalizeReference(value.baseline, LayoutData.prev) : 'auto',
      width: has(value,'width') ? normalizeNumber(value.width)  : 'auto',
      height: has(value, 'height') ? normalizeNumber(value.height)  : 'auto'
    });
  }

  constructor(parameters) {
    if (!(parameters instanceof Object)) {
      throw new Error('Not an object: ' + parameters);
    }
    if (parameters.constructor !== Object) {
      throw new Error('Not a parameter object: ' + parameters.constructor.name);
    }
    setConstraintValue(this, parameters, 'left');
    setConstraintValue(this, parameters, 'top');
    setConstraintValue(this, parameters, 'right');
    setConstraintValue(this, parameters, 'bottom');
    setDimension(this, parameters, 'width');
    setDimension(this, parameters, 'height');
    setOffset(this, parameters, 'centerX');
    setOffset(this, parameters, 'centerY');
    setSiblingReference(this, parameters, 'baseline');
  }

  toString() {
    return JSON.stringify({
      left: this.left.toString(),
      right: this.right.toString(),
      top: this.top.toString(),
      bottom: this.bottom.toString(),
      width: this.width,
      height: this.height,
      centerX: this.centerX,
      centerY: this.centerY,
      baseline: referenceToString(this.baseline)
    });
  }

}

export function mergeLayoutData(targetValue, sourceValue) {
  const target = LayoutData.from(targetValue);
  const source = LayoutData.from(sourceValue);
  return LayoutData.from({
    left: has(source, 'left') ? source.left : target.left,
    right: has(source, 'right') ? source.right : target.right,
    top: has(source, 'top') ? source.top : target.top,
    bottom: has(source, 'bottom') ? source.bottom : target.bottom,
    centerX: has(source, 'centerX') ? source.centerX : target.centerX,
    centerY: has(source, 'centerY') ? source.centerY : target.centerY,
    baseline: has(source, 'baseline') ? source.baseline : target.baseline,
    width: has(source,'width') ? source.width : target.width,
    height: has(source, 'height') ? source.height : target.height
  });
}

function has(layoutDataValue, prop) {
  return layoutDataValue[prop] != null && layoutDataValue[prop] !== 'auto';
}

function setConstraintValue(layoutData, parameters, property) {
  const value = (property in parameters) ? parameters[property] : 'auto';
  if (value === 'auto' || value instanceof ConstraintExports.default) {
    return Object.defineProperty(layoutData, property, {enumerable: true, value});
  }
  throw new Error(`Invalid ${property} constraint ${value}`);
}

function setDimension(layoutData, parameters, property) {
  const value = (property in parameters) ? parameters[property] : 'auto';
  if (value !== 'auto') {
    checkNumber(value, [0, Infinity]);
  }
  Object.defineProperty(layoutData, property, {enumerable: true, value});
}

function setOffset(layoutData, parameters, property) {
  const value = (property in parameters) ? parameters[property] : 'auto';
  if (value !== 'auto') {
    checkNumber(value, [-Infinity, Infinity], `Invalid ${property}`);
  }
  Object.defineProperty(layoutData, property, {enumerable: true, value});
}

function setSiblingReference(layoutData, parameters, property) {
  const value = (property in parameters) ? parameters[property] : 'auto';
  if (value !== 'auto') {
    checkIsValidSiblingReference(value);
  }
  return Object.defineProperty(layoutData, property, {enumerable: true, value});
}
