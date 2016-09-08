import {types} from "./property-types";
import Proxy from "./Proxy";

var ClientStore = Proxy.extend({
  _cid: "tabris.ClientStore"
});

var SecureStore = Proxy.extend({
  _cid: "tabris.SecureStore"
});

var encode = types.string.encode;

export function create(secure) {
  function Storage() {
    var proxy = secure ? new SecureStore() : new ClientStore();
    Object.defineProperty(this, "_proxy", {value: proxy});
  }
  Storage.prototype = WebStorage.prototype;
  return new Storage();
}

export default function WebStorage() {
  throw new Error("Cannot instantiate WebStorage");
}

WebStorage.prototype = {
  // Note: key and length methods currently not supported

  setItem: function(key, value) {
    if (arguments.length < 2) {
      throw new TypeError("Not enough arguments to 'setItem'");
    }
    this._proxy._nativeCall("add", {
      key: encode(key),
      value: encode(value)
    });
  },

  getItem: function(key) {
    if (arguments.length < 1) {
      throw new TypeError("Not enough arguments to 'getItem'");
    }
    var result = this._proxy._nativeCall("get", {key: encode(key)});
    // Note: iOS can not return null, only undefined:
    return result === undefined ? null : result;
  },

  removeItem: function(key) {
    if (arguments.length < 1) {
      throw new TypeError("Not enough arguments to 'removeItem'");
    }
    this._proxy._nativeCall("remove", {keys: [encode(key)]});
  },

  clear: function() {
    this._proxy._nativeCall("clear");
  }

};
