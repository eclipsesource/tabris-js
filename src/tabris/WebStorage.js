import {extendPrototype} from "./util";
import {types} from "./property-types";

tabris.registerType("_ClientStore", {
  _cid: "tabris.ClientStore"
});

tabris.registerType("_SecureStore", {
  _cid: "tabris.SecureStore"
});

var encode = types.string.encode;

function createStorage(secure) {
  function Storage() {
    var proxy = secure ? new tabris._SecureStore() : new tabris._ClientStore();
    Object.defineProperty(this, "_proxy", {value: proxy});
  }
  Storage.prototype = tabris.Storage.prototype;
  return new Storage();
}

tabris.Storage = function() {
  throw new Error("Cannot instantiate Storage");
};

tabris.Storage.prototype = {
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

tabris.StorageEvent = function(type) {
  this.type = type;
};

tabris.StorageEvent.prototype = extendPrototype(tabris.DOMEvent, {
  bubbles: false,
  cancelable: false,
  key: "",
  oldValue: null,
  newValue: null,
  url: "",
  storageArea: null
});

tabris.load(function() {
  tabris.localStorage = createStorage();
  if (device.platform === "iOS") {
    tabris.secureStorage = createStorage(true);
  }
  if (!window.Storage) {
    window.Storage = tabris.Storage;
    window.localStorage = tabris.localStorage;
    if (tabris.secureStorage) {
      window.secureStorage = tabris.secureStorage;
    }
  }
});
