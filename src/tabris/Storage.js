import NativeObject from './NativeObject';

class ClientStore extends NativeObject {
  constructor() {
    super();
    this._create('tabris.ClientStore');
  }
}

class SecureStore extends NativeObject {
  constructor() {
    super();
    this._create('tabris.SecureStore');
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
      throw new TypeError("Not enough arguments to 'setItem'");
    }
    this._nativeObject._nativeCall('add', {
      key: encode(key),
      value: encode(value)
    });
  }

  getItem(key) {
    if (arguments.length < 1) {
      throw new TypeError("Not enough arguments to 'getItem'");
    }
    const result = this._nativeObject._nativeCall('get', {key: encode(key)});
    // Note: iOS can not return null, only undefined:
    return result === undefined ? null : result;
  }

  removeItem(key) {
    if (arguments.length < 1) {
      throw new TypeError("Not enough arguments to 'removeItem'");
    }
    this._nativeObject._nativeCall('remove', {keys: [encode(key)]});
  }

  clear() {
    this._nativeObject._nativeCall('clear');
  }

}

function encode(value) {
  return '' + value;
}

export function create(secure) {
  const nativeObject = secure ? new SecureStore() : new ClientStore();
  return new Storage(nativeObject);
}
