import NativeObject from './NativeObject';
import {toValueString} from './Console';

export default class Crypto extends NativeObject {

  get _nativeType() {
    return 'tabris.Crypto';
  }

  getRandomValues(typedArray) {
    if (arguments.length === 0) {
      throw new Error('Not enough arguments to Crypto.getRandomValues');
    }
    if (!isIntArray(typedArray)) {
      throw new Error(`Argument ${toValueString(typedArray)} is not an accepted array type`);
    }
    const byteLength = typedArray.byteLength;
    const values = new Uint8Array(this._nativeCall('getRandomValues', {byteLength}));
    if (values.byteLength !== byteLength) {
      throw new Error('Not enough random bytes available');
    }
    new Uint8Array(typedArray.buffer).set(values);
  }

}

function isIntArray(value) {
  return (value instanceof Int8Array) ||
         (value instanceof Uint8Array) ||
         (value instanceof Uint8ClampedArray) ||
         (value instanceof Int16Array) ||
         (value instanceof Uint16Array) ||
         (value instanceof Int32Array) ||
         (value instanceof Uint32Array);
}
