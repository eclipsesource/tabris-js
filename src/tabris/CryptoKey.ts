import {TypedArray} from './Crypto';
import NativeObject from './NativeObject';
import {getBuffer, getCid, setNativeObject} from './util';

export type AlgorithmInternal = AlgorithmHKDF | AlgorithmECDH | AlgorithmECDSA | 'HKDF' | 'AES-GCM';

export type Algorithm = AlgorithmInternal | {name: 'AES-GCM'};

export type AlgorithmHKDF = {
  name: 'HKDF',
  hash: string,
  salt: ArrayBuffer | TypedArray,
  info: ArrayBuffer | TypedArray
};

export type AlgorithmECDH = {
  name: 'ECDH',
  namedCurve: 'P-256',
  public?: CryptoKey
};

export type AlgorithmECDSA = {
  name: 'ECDSA',
  namedCurve: 'P-256'
};

export type GenerateKeyOptions = { usageRequiresAuth?: boolean };

export default class CryptoKey {

  constructor(nativeObject: _CryptoKey, data: CryptoKey) {
    if (!(nativeObject instanceof _CryptoKey)) {
      throw new TypeError('Illegal constructor');
    }
    setNativeObject(this, nativeObject);
    Object.assign(this, data);
    Object.freeze(this);
  }

  algorithm?: AlgorithmInternal;

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
    algorithm: AlgorithmInternal,
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
    algorithm: Algorithm,
    baseKey: CryptoKey,
    derivedKeyAlgorithm: {name: string, length: number},
    extractable: boolean,
    keyUsages: string[],
    authPromptTitle?: string,
    authPromptMessage?: string
  ): Promise<void> {
    return new Promise((onSuccess, onError) => {
      if (typeof algorithm === 'string') {
        throw new TypeError(algorithm + ' not supported');
      }
      if(algorithm.name === 'ECDH') {
        return this._nativeCall('derive', {
          algorithm: {...algorithm, public: getCid(algorithm.public!)},
          baseKey: getCid(baseKey),
          derivedKeyAlgorithm,
          extractable,
          keyUsages,
          authPromptTitle,
          authPromptMessage,
          onSuccess,
          onError: wrapErrorCb(onError)
        });
      } else if(algorithm.name === 'HKDF') {
        return this._nativeCall('derive', {
          algorithm: {...algorithm, salt: getBuffer(algorithm.salt), info: getBuffer(algorithm.info)},
          baseKey: getCid(baseKey),
          derivedKeyAlgorithm,
          extractable,
          keyUsages,
          authPromptTitle,
          authPromptMessage,
          onSuccess,
          onError: wrapErrorCb(onError)
        });
      } else {
        throw new TypeError('Algorithm not supported');
      }
    });
  }

  async generate(
    algorithm: AlgorithmECDH | AlgorithmECDSA,
    extractable: boolean,
    keyUsages: string[],
    usageRequiresAuth?: boolean
  ): Promise<void> {
    return new Promise((onSuccess, onError) =>
      this._nativeCall('generate', {
        algorithm,
        extractable,
        keyUsages,
        usageRequiresAuth,
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
