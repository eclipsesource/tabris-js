import Constraint from './Constraint';
import {checkIsValidSiblingReference, referenceToString, normalizeNumber, normalizeReference} from './Constraint';
import {checkNumber} from './util';

export default class LayoutData {

  static from(layoutDataValue) {
    if (!(layoutDataValue instanceof Object)) {
      throw new Error('Not an object: ' + typeof layoutDataValue);
    }
    if (layoutDataValue instanceof LayoutData) {
      return layoutDataValue;
    }
    if (layoutDataValue.constructor !== Object) {
      throw new Error('Not a parameter object: ' + layoutDataValue.constructor.name);
    }
    return new LayoutData({
      left: has(layoutDataValue, 'left') ? Constraint.from(layoutDataValue.left) : 'auto',
      right: has(layoutDataValue, 'right') ? Constraint.from(layoutDataValue.right) : 'auto',
      top: has(layoutDataValue, 'top') ? Constraint.from(layoutDataValue.top) : 'auto',
      bottom: has(layoutDataValue, 'bottom') ? Constraint.from(layoutDataValue.bottom) : 'auto',
      centerX: has(layoutDataValue, 'centerX') ? normalizeNumber(layoutDataValue.centerX) : 'auto',
      centerY: has(layoutDataValue, 'centerY') ? normalizeNumber(layoutDataValue.centerY) : 'auto',
      baseline: has(layoutDataValue, 'baseline') ? normalizeReference(layoutDataValue.baseline) : 'auto',
      width: has(layoutDataValue,'width') ? normalizeNumber(layoutDataValue.width)  : 'auto',
      height: has(layoutDataValue, 'height') ? normalizeNumber(layoutDataValue.height)  : 'auto'
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

LayoutData.prev = Constraint.prev;
LayoutData.next = Constraint.next;

function has(layoutDataValue, prop) {
  return layoutDataValue[prop] != null && layoutDataValue[prop] !== 'auto';
}

function setConstraintValue(layoutData, parameters, property) {
  const value = (property in parameters) ? parameters[property] : 'auto';
  if (value === 'auto' || value instanceof Constraint) {
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
    checkNumber(value);
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
