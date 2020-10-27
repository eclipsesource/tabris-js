import checkType from './checkType';
import {setterTargetType} from './symbols';
import Widget from './Widget';

export default function Setter(arg1: Function, arg2?: object): object {
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

