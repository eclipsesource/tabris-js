type TypedArray = Int8Array | Uint8Array | Uint8ClampedArray | Int16Array | Uint16Array | Int32Array | Uint32Array;

declare class Crypto {
  getRandomValues(typedArray: TypedArray): TypedArray;
}

declare var crypto: Crypto;
