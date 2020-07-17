import checkType from './checkType';
import {setterTargetType} from './symbols';
import Widget from './Widget';

/**
 * @param {Function|object} arg1
 * @param {object} arg2
 * @returns {object}
 */
export default function Set(arg1, arg2) {
  if (arguments.length !== 2) {
    throw new TypeError(`Expected 1-2 arguments, got ${arguments.length}`);
  }
  checkType(arg1, Function, {name: 'parameter 1'});
  checkType(arg2, Object, {name: 'parameter 2'});
  checkType(arg1.prototype, Widget, {name: 'prototype'});
  const result = Object.assign({}, arg2);
  Object.defineProperty(result, setterTargetType, {
    enumerable: false, value: arg1
  });
  return result;
}

