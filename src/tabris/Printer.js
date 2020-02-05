import NativeObject from './NativeObject';

export default class Printer extends NativeObject {

  /** @override */
  _nativeCreate(param) {
    if (param !== true) {
      throw new Error('Printer can not be created');
    }
    super._nativeCreate();
  }

  get _nativeType() {
    return 'tabris.Printer';
  }

  print(data, options) {
    return new Promise((resolve, reject) => {
      if (arguments.length < 1) {
        throw new Error('Not enough arguments to print');
      }
      if (!isDataValid(data)) {
        throw new Error('data is not an ArrayBuffer or typed array');
      }
      this._nativeCall('print', {
        data: data instanceof ArrayBuffer ? data : data.buffer,
        options,
        onResult: (result) => resolve({result}),
        onError: (error) => reject(new Error(error))
      });
    });
  }

  dispose() {
    throw new Error('Cannot dispose printer object');
  }

}

function isDataValid(value) {
  return (value instanceof ArrayBuffer) ||
    (value instanceof Int8Array) ||
    (value instanceof Uint8Array) ||
    (value instanceof Uint8ClampedArray) ||
    (value instanceof Int16Array) ||
    (value instanceof Uint16Array) ||
    (value instanceof Int32Array) ||
    (value instanceof Uint32Array) ||
    (value instanceof Float32Array) ||
    (value instanceof Float64Array);
}

export function create() {
  return new Printer(true);
}
