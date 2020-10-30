import NativeObject from './NativeObject';
import {toValueString} from './Console';

export type TypedArray = Int8Array | Uint8Array | Uint8ClampedArray
  | Int16Array | Uint16Array | Int32Array | Uint32Array;

export default class Crypto {

  readonly subtle!: SubtleCrypto;
  private readonly _nativeObject!: NativeCrypto;

  constructor() {
    Object.defineProperties(this, {
      _nativeObject: {enumerable: false, writable: false, value: NativeCrypto.getInstance()},
      subtle: {enumerable: false, writable: false, value: new SubtleCrypto()}
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

const validAlgorithms = new Set(['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512']);

class SubtleCrypto {

  private readonly _nativeObject!: NativeCrypto;

  constructor() {
    Object.defineProperty(this, '_nativeObject', {
      enumerable: false, writable: false, value: NativeCrypto.getInstance()
    });
  }

  async digest(algorithm: string, data: ArrayBuffer | TypedArray) {
    if (arguments.length < 2) {
      return Promise.reject(new TypeError('Not enough arguments to SubtleCrypto.digest'));
    }
    if (!validAlgorithms.has(algorithm)) {
      return Promise.reject(new TypeError(`Algorithm: Unrecognized name ${algorithm}`));
    }
    if (!isIntArray(data) && !(data instanceof ArrayBuffer)) {
      return Promise.reject(new TypeError(`Argument ${toValueString(data)} is not an accepted array type`));
    }
    return new Promise(
      (resolve, reject) => this._nativeObject.subtleDigest({algorithm, data, resolve, reject})
    );
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

  subtleDigest(arg: {
    algorithm: string,
    data: ArrayBuffer | TypedArray,
    resolve: (buffer: ArrayBuffer) => any,
    reject: (ex: Error) => any
  }) {
    this._nativeCall('subtleDigest', {
      algorithm: arg.algorithm,
      data: ArrayBuffer.isView(arg.data) ? arg.data.buffer : arg.data,
      onSuccess: (result: ArrayBuffer) => {
        if (!(result instanceof ArrayBuffer) || result.byteLength === 0) {
          throw new TypeError('Internal Type Error: result is not valid ArrayBuffer');
        }
        arg.resolve(result);
      },
      onError: (reason: unknown) => arg.reject(new Error(String(reason)))
    });
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
