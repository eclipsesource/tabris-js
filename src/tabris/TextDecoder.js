import NativeObject from './NativeObject';

const SUPPORTED_ENCODINGS = ['ascii', 'utf-8'];

class TextDecoder extends NativeObject {

  constructor() {
    super();
    this._create('tabris.TextDecoder');
    this._nativeListen('result', true);
    this._nativeListen('error', true);
  }

  decode(buffer, encoding) {
    this._nativeCall('decode', {data: buffer, encoding});
  }

}

export function decode(buffer, encoding) {
  return new Promise((resolve, reject) => {
    if (ArrayBuffer.isView(buffer)) {
      buffer = buffer.buffer;
    }
    if (!(buffer instanceof ArrayBuffer)) {
      throw new Error('Invalid buffer type');
    }
    encoding = encoding || 'utf-8';
    if (!SUPPORTED_ENCODINGS.includes(encoding)) {
      throw new Error(`Unsupported encoding: '${encoding}'`);
    }
    new TextDecoder()
      .on('result', ({target, string}) => {
        resolve(string);
        target.dispose();
      })
      .on('error', ({target}) => {
        reject(new Error('Could not decode ' + encoding));
        target.dispose();
      })
      .decode(buffer, encoding);
  });
}
