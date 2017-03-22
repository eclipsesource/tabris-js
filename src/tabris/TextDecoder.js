import NativeObject from './NativeObject';

const SUPPORTED_ENCODINGS = ['ascii', 'utf-8'];

class TextDecoder extends NativeObject {

  constructor() {
    super();
    this._create('tabris.TextDecoder');
    this._nativeListen('result', true);
  }

  decode(buffer, encoding = 'utf-8') {
    if (ArrayBuffer.isView(buffer)) {
      buffer = buffer.buffer;
    }
    if (!(buffer instanceof ArrayBuffer)) {
      throw new Error('Invalid buffer type');
    }
    if (!SUPPORTED_ENCODINGS.includes(encoding)) {
      throw new Error(`Unsupported encoding: '${encoding}'`);
    }
    this._nativeCall('decode', {buffer, encoding});
  }

}

export function decode(buffer, encoding) {
  return new Promise((resolve) => {
    new TextDecoder().on('result', ({target, string}) => {
      resolve(string);
      target.dispose();
    }).decode(buffer, encoding);
  });
}
