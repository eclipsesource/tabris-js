import {types} from './property-types';
import NativeObject from './NativeObject';

let ClientStore = NativeObject.extend({
  _cid: 'tabris.ClientStore'
});

let SecureStore = NativeObject.extend({
  _cid: 'tabris.SecureStore'
});

let encode = types.string.encode;

export function create(secure) {
  function Storage() {
    let proxy = secure ? new SecureStore() : new ClientStore();
    Object.defineProperty(this, '_proxy', {value: proxy});
  }
  Storage.prototype = WebStorage.prototype;
  return new Storage();
}

export default function WebStorage() {
  throw new Error('Cannot instantiate WebStorage');
}

WebStorage.prototype = {
  // Note: key and length methods currently not supported

  setItem(key, value) {
    if (arguments.length < 2) {
      throw new TypeError("Not enough arguments to 'setItem'");
    }
    this._proxy._nativeCall('add', {
      key: encode(key),
      value: encode(value)
    });
  },

  getItem(key) {
    if (arguments.length < 1) {
      throw new TypeError("Not enough arguments to 'getItem'");
    }
    let result = this._proxy._nativeCall('get', {key: encode(key)});
    // Note: iOS can not return null, only undefined:
    return result === undefined ? null : result;
  },

  removeItem(key) {
    if (arguments.length < 1) {
      throw new TypeError("Not enough arguments to 'removeItem'");
    }
    this._proxy._nativeCall('remove', {keys: [encode(key)]});
  },

  clear() {
    this._proxy._nativeCall('clear');
  }

};
