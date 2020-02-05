import NativeObject from './NativeObject';
import {toXML} from './Console';

class NativeStore extends NativeObject {

  constructor(secure) {
    super(secure);
  }

  get keys() {
    return this._nativeCall('keys');
  }

  /** @override */
  _nativeCreate(secure) {
    this.secure = secure;
    super._nativeCreate();
  }

  get _nativeType() {
    return this.secure ? 'tabris.SecureStore' : 'tabris.ClientStore';
  }

  _getXMLElementName() {
    return 'Storage';
  }

  _getXMLAttributes() {
    return [['length', this.keys.length]];
  }

  _getXMLContent() {
    return this.keys.map(key => {
      const value = this._nativeCall('get', {key});
      const item = key.replace(/[^a-zA-Z0-9_.:-]/g, '');
      const lines = value.split('\n');
      if (lines.length === 1) {
        return `  <${item}>${value}</${item}>`;
      }
      return `  <${item}>\n${lines.map(line => '    ' + line).join('\n')}\n  </${item}>`;
    });
  }

}

export default class Storage {

  constructor() {
    const nativeObject = arguments[0];
    if (!(nativeObject instanceof NativeObject)) {
      throw new Error('Cannot instantiate Storage');
    }
    Object.defineProperty(this, '_nativeObject', {value: nativeObject});
  }

  // Note: key and length methods currently not supported

  setItem(key, value) {
    if (arguments.length < 2) {
      throw new TypeError('Not enough arguments to \'setItem\'');
    }
    this._nativeObject._nativeCall('add', {
      key: encode(key),
      value: encode(value)
    });
  }

  getItem(key) {
    if (arguments.length < 1) {
      throw new TypeError('Not enough arguments to \'getItem\'');
    }
    const result = this._nativeObject._nativeCall('get', {key: encode(key)});
    // Note: iOS can not return null, only undefined:
    return result === undefined ? null : result;
  }

  removeItem(key) {
    if (arguments.length < 1) {
      throw new TypeError('Not enough arguments to \'removeItem\'');
    }
    this._nativeObject._nativeCall('remove', {keys: [encode(key)]});
  }

  clear() {
    this._nativeObject._nativeCall('clear');
  }

  key(index) {
    return this._nativeObject.keys[index] || null;
  }

  [toXML]() {
    return this._nativeObject[toXML]();
  }

  get length() {
    return this._nativeObject.keys.length;
  }

}

function encode(value) {
  return '' + value;
}

export function create(secure) {
  return new Storage(new NativeStore(secure));
}
