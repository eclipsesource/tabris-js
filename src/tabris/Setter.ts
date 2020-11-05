import checkType from './checkType';
import NativeObject from './NativeObject';
import {setterTargetType} from './symbols';
import Composite from './widgets/Composite';

interface SetterAttributes {
  target: Function;
  attribute: string;
  children: any[];
}

function Setter(target: Function, attr: object): object;
function Setter(target: Function, selector: string, attr: object): object;
function Setter(attr: SetterAttributes): object;
function Setter(arg1: Function | SetterAttributes, arg2?: unknown, arg3?: unknown): object {
  if (arguments.length < 1 || arguments.length > 3) {
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
  } else if (arguments.length === 2) {
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
  } else {
    const target = arg1 as Function;
    const selector = arg2 as string;
    const attr = arg3 as object;
    checkType(selector, String, {name: 'parameter 2'});
    checkType(attr, Object, {name: 'parameter 3'});
    return {
      [selector]: Setter(target, attr)
    };
  }
}

export default Setter;

export const Apply = (attr: {children: object[]}) =>
  Setter({target: Composite, attribute: 'apply', ...attr});
