import NativeObject from './NativeObject';

const SUPPORTED_ENCODINGS = ['ascii', 'utf-8'];

export default class TextEncoder extends NativeObject {

  constructor() {
    super();
    this._nativeListen('result', true);
    this._nativeListen('error', true);
  }

  encode(text, encoding) {
    this._nativeCall('encode', {text, encoding});
  }

  get _nativeType() {
    return 'tabris.TextEncoder';
  }

  static encode(text, encoding) {
    return new Promise((resolve, reject) => {
      if (typeof text !== 'string') {
        throw new Error('Invalid text, must be a string');
      }
      encoding = encoding || 'utf-8';
      if (!SUPPORTED_ENCODINGS.includes(encoding)) {
        throw new Error(`Unsupported encoding: '${encoding}'`);
      }
      new TextEncoder()
        .on('result', ({target, data}) => {
          resolve(data);
          target.dispose();
        })
        .on('error', ({target}) => {
          reject(new Error('Could not encode ' + encoding));
          target.dispose();
        })
        .encode(text, encoding);
    });
  }

}
