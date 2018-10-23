import Widget from '../../src/tabris/Widget';
import Percent from './Percent';
import {checkNumber} from './util';

const selectorRegex = /^(\*|([#.A-Z][A-Za-z0-9_-]+))$/;
const numberRegex = /^[+-]?([0-9]+|[0-9]*\.[0-9]+)$/;
const zeroPercent = new Percent(0);

export default class Constraint {

  static from(constraintValue) {
    if (typeof constraintValue === 'string') {
      const str = constraintValue.trim();
      if (str.indexOf(' ') !== -1) {
        return fromArray(str.split(/\s+/));
      }
      if (numberRegex.test(str)) {
        return new Constraint(zeroPercent, parseFloat(str));
      }
      return new Constraint(normalizeReference(str), 0);
    }
    if (Array.isArray(constraintValue)) {
      return fromArray(constraintValue);
    }
    if (typeof constraintValue === 'number') {
      return new Constraint(zeroPercent, normalizeNumber(constraintValue));
    }
    if (constraintValue instanceof Widget
      || typeof constraintValue === 'symbol'
      || Percent.isValidPercentValue(constraintValue)
    ) {
      return new Constraint(normalizeReference(constraintValue), 0);
    }
    if ('reference' in constraintValue || 'offset' in constraintValue) {
      return fromArray([constraintValue.reference || zeroPercent, constraintValue.offset || 0]);
    }
    throw new Error('Invalid constraint: ' + constraintValue);
  }

  constructor(reference, offset) {
    if (typeof reference === 'string' && !selectorRegex.test(reference)) {
      throw new Error('Invalid sibling selector: ' + reference);
    }
    if (!(reference instanceof Percent)) {
      checkIsValidSiblingReference(reference);
    }
    checkNumber(offset);
    Object.defineProperty(this, 'reference', {enumerable: true, value: reference});
    Object.defineProperty(this, 'offset', {enumerable: true, value: offset});
  }

  toString() {
    return `${referenceToString(this.reference)} ${this.offset}`;
  }

  toArray() {
    return [this.reference, this.offset];
  }

}

Constraint.next = Symbol('next()');
Constraint.prev = Symbol('prev()');

export function checkIsValidSiblingReference(reference) {
  if (typeof reference === 'string' && !selectorRegex.test(reference)) {
    throw new Error('Invalid sibling selector: ' + reference);
  }
  if (
    typeof reference !== 'string'
    && !(reference instanceof Widget)
    && reference !== Constraint.next
    && reference !== Constraint.prev
  ) {
    throw new Error('Invalid constraint reference: ' + reference);
  }
}

export function referenceToString(reference) {
  if (reference instanceof Percent) {
    return reference + '%';
  }
  if (reference instanceof Widget) {
    return `${reference.constructor.name}[cid="${reference.cid}"]`;
  }
  if (reference === Constraint.next) {
    return 'next()';
  }
  if (reference === Constraint.prev) {
    return 'prev()';
  }
  return reference;
}

export function normalizeReference(reference) {
  if (Percent.isValidPercentValue(reference)) {
    return Percent.from(reference);
  }
  if (reference instanceof Widget || reference === Constraint.next || reference === Constraint.prev) {
    return reference;
  }
  if (typeof reference === 'string') {
    const str = reference.trim();
    if (str === 'prev()') {
      return Constraint.prev;
    }
    if (str === 'next()') {
      return Constraint.next;
    }
    if (selectorRegex.test(str)) {
      return str;
    }
  }
  throw new Error('Not a percentage or widget reference: ' + reference);
}

export function normalizeNumber(value) {
  if (typeof value === 'string' && numberRegex.test(value)) {
    return parseFloat(value);
  }
  return value;
}

function fromArray(array) {
  if (array.length !== 2) {
    throw new Error('Wrong number of elements in constraint array: ' + array.length);
  }
  return new Constraint(normalizeReference(array[0]), normalizeNumber(array[1]));
}
