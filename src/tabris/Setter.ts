import checkType from './checkType';
import NativeObject from './NativeObject';
import {setterTargetType} from './symbols';

interface SetterAttributes {
  target: Function;
  attribute: string;
  children: any[];
}

function Setter(target: Function, attr: object): object;
function Setter(attr: SetterAttributes): object;
function Setter(arg1: Function | SetterAttributes, arg2?: object): object {
  if (arguments.length !== 1 && arguments.length !== 2) {
    throw new TypeError(`Expected 1-2 arguments, got ${arguments.length}`);
  }
  if (arguments.length === 1) {
    const setterAttr = arg1 as SetterAttributes;
    checkType(setterAttr, Object, {name: 'parameter 1'});
    checkType(setterAttr.attribute, String, {name: 'attribute'});
    checkType(setterAttr.children, Array, {name: 'children'});
    if (setterAttr.children.length < 1) {
      throw new TypeError('value is missing');
    }
    if (setterAttr.children.length > 1) {
      throw new TypeError('too many child elements');
    }
    return Setter(setterAttr.target, {[setterAttr.attribute]: setterAttr.children[0]});
  }
  const target = arg1 as Function;
  const attr = arg2 as object;
  checkType(target, Function, {name: 'target', typeName: 'a constructor'});
  checkType(attr, Object, {name: 'parameter 2'});
  checkType(target.prototype, NativeObject, {name: 'target', typeName: 'a widget or dialog constructor'});
  const result = Object.assign({}, arg2);
  Object.defineProperty(result, setterTargetType, {
    enumerable: false, value: arg1
  });
  return result;
}

export default Setter;
