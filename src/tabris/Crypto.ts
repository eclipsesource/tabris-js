import NativeObject from './NativeObject';
import {toValueString} from './Console';

export type TypedArray = Int8Array | Uint8Array | Uint8ClampedArray
  | Int16Array | Uint16Array | Int32Array | Uint32Array;

export default class Crypto {

  private readonly _nativeObject!: NativeCrypto;

  constructor() {
    Object.defineProperty(this, '_nativeObject', {
      enumerable: false, writable: false, value: NativeCrypto.getInstance()
    });
  }

  getRandomValues(typedArray: TypedArray) {
    if (arguments.length === 0) {
      throw new Error('Not enough arguments to Crypto.getRandomValues');
    }
    if (!isIntArray(typedArray)) {
      throw new Error(`Argument ${toValueString(typedArray)} is not an accepted array type`);
    }
    return this._nativeObject.getRandomValues(typedArray);
  }

}

class NativeCrypto extends NativeObject {

  private static instance: NativeCrypto;

  static getInstance() {
    if (!this.instance) {
      this.instance = new NativeCrypto();
    }
    return this.instance;
  }

  get _nativeType() {
    return 'tabris.Crypto';
  }

  getRandomValues(typedArray: TypedArray) {
    const byteLength = typedArray.byteLength;
    const values = new Uint8Array(this._nativeCall('getRandomValues', {byteLength}));
    if (values.byteLength !== byteLength) {
      throw new Error('Not enough random bytes available');
    }
    new Uint8Array(typedArray.buffer).set(values);
    return typedArray;
  }

}

function isIntArray(value: unknown): value is TypedArray {
  return (value instanceof Int8Array) ||
         (value instanceof Uint8Array) ||
         (value instanceof Uint8ClampedArray) ||
         (value instanceof Int16Array) ||
         (value instanceof Uint16Array) ||
         (value instanceof Int32Array) ||
         (value instanceof Uint32Array);
}
