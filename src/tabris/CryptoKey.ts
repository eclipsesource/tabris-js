import {TypedArray} from './Crypto';
import NativeObject from './NativeObject';
import {getBuffer, getCid, setNativeObject} from './util';

export default class CryptoKey {

  constructor(nativeObject: _CryptoKey, data: CryptoKey) {
    if (!(nativeObject instanceof _CryptoKey)) {
      throw new TypeError('Illegal constructor');
    }
    setNativeObject(this, nativeObject);
    Object.assign(this, data);
    Object.freeze(this);
  }

  algorithm?: {name: string, namedCurve: string};

  extractable?: boolean;

  type?: 'secret' | 'private' | 'public';

  usages?: readonly string[];
}

export class _CryptoKey extends NativeObject {

  constructor(keyPair?: _CryptoKey, type?: 'public' | 'private') {
    super(keyPair ? {parent: keyPair.cid, type} : {});
  }

  get _nativeType() {
    return 'tabris.CryptoKey';
  }

  async import(
    format: string,
    keyData: ArrayBuffer | TypedArray,
    algorithm: {name: string, namedCurve: string},
    extractable: boolean,
    keyUsages: string[]
  ): Promise<CryptoKey> {
    return new Promise((onSuccess, onError) =>
      this._nativeCall('import', {
        format,
        keyData: getBuffer(keyData),
        algorithm,
        extractable,
        keyUsages,
        onSuccess,
        onError: wrapErrorCb(onError)
      })
    );
  }

  async derive(
    algorithm: {name: string, namedCurve: string, public: CryptoKey},
    baseKey: CryptoKey,
    derivedKeyAlgorithm: {name: string, length: number},
    extractable: boolean,
    keyUsages: string[]
  ): Promise<void> {
    return new Promise((onSuccess, onError) =>
      this._nativeCall('derive', {
        algorithm: {...algorithm, public: getCid(algorithm.public)},
        baseKey: getCid(baseKey),
        derivedKeyAlgorithm,
        extractable,
        keyUsages,
        onSuccess,
        onError: wrapErrorCb(onError)
      })
    );
  }

  async generate(
    algorithm: {name: string, namedCurve: string},
    extractable: boolean,
    keyUsages: string[]
  ): Promise<void> {
    return new Promise((onSuccess, onError) =>
      this._nativeCall('generate', {
        algorithm,
        extractable,
        keyUsages,
        onSuccess,
        onError: wrapErrorCb(onError)
      })
    );
  }

}

NativeObject.defineProperties(_CryptoKey.prototype, {
  parent: {type: 'string', const: true, nocache: true},
  type: {type: 'string', const: true, nocache: true, choice: ['public', 'private']}
});

function wrapErrorCb(onError: (reason?: any) => void): unknown {
  return (reason: string) => onError(new Error(String(reason)));
}
