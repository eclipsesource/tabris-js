import NativeObject from './NativeObject';

let _Crypto = NativeObject.extend({
  _type: 'tabris.Crypto'
});

let proxy;

export default function Crypto() {
  proxy = new _Crypto();
}

Crypto.prototype = {

  getRandomValues: function(typedArray) {
    if (arguments.length === 0) {
      throw new Error('Not enough arguments to Crypto.getRandomValues');
    }
    if (!isIntArray(typedArray)) {
      throw new Error('Unsupported type in Crypto.getRandomValues');
    }
    let byteLength = typedArray.byteLength;
    let values = proxy._nativeCall('getRandomValues', {byteLength: byteLength});
    if (values.length !== byteLength) {
      throw new Error('Not enough random bytes available');
    }
    new Uint8Array(typedArray.buffer).set(values);
  }

};

function isIntArray(value) {
  return (value instanceof Int8Array) ||
          (value instanceof Uint8Array) ||
          (value instanceof Uint8ClampedArray) ||
          (value instanceof Int16Array) ||
          (value instanceof Uint16Array) ||
          (value instanceof Int32Array) ||
          (value instanceof Uint32Array);
}
