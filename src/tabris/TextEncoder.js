import NativeObject from './NativeObject';

const SUPPORTED_ENCODINGS = ['ascii', 'utf-8'];

export default class TextEncoder extends NativeObject {

  constructor() {
    super();
    this._create('tabris.TextEncoder');
  }

  encode(text, encoding) {
    this._nativeListen('result', true);
    this._nativeListen('error', true);
    this._nativeCall('encode', {text, encoding});
  }

  encodeSync(text, encoding) {
    return this._nativeCall('encodeSync', {text, encoding});
  }

  /**
   * @return {TextEncoder}
   */
  static getInstance() {
    if (!this._instance) {
      this._instance = new TextEncoder();
    }
    return this._instance;
  }

  static encode(text, encoding) {
    return new Promise((resolve, reject) => {
      encoding = encoding || 'utf-8';
      paramCheck(text, encoding);
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

  static encodeSync(text, encoding) {
    encoding = encoding || 'utf-8';
    paramCheck(text, encoding);
    return TextEncoder.getInstance().encodeSync(text, encoding);
  }

}

TextEncoder._instance = null;

function paramCheck(text, encoding) {
  if (typeof text !== 'string') {
    throw new Error('Invalid text, must be a string');
  }
  if (!SUPPORTED_ENCODINGS.includes(encoding)) {
    throw new Error(`Unsupported encoding: ${encoding}`);
  }
}
