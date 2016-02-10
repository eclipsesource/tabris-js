(function() {

  tabris.registerType("_ClientStore", {
    _cid: "tabris.ClientStore"
  });

  var encode = tabris.PropertyTypes.string.encode;
  var proxy;

  tabris.WebStorage = function() {
    proxy = new tabris._ClientStore();
  };

  tabris.WebStorage.prototype = {
    // Note: key and length methods currently not supported

    setItem: function(key, value) {
      if (arguments.length < 2) {
        throw new TypeError("Not enough arguments to 'setItem'");
      }
      proxy._nativeCall("add", {
        key: encode(key),
        value: encode(value)
      });
    },

    getItem: function(key) {
      if (arguments.length < 1) {
        throw new TypeError("Not enough arguments to 'getItem'");
      }
      var result = proxy._nativeCall("get", {key: encode(key)});
      // Note: iOS can not return null, only undefined:
      return result === undefined ? null : result;
    },

    removeItem: function(key) {
      if (arguments.length < 1) {
        throw new TypeError("Not enough arguments to 'removeItem'");
      }
      proxy._nativeCall("remove", {keys: [encode(key)]});
    },

    clear: function() {
      proxy._nativeCall("clear");
    }

  };

  tabris.StorageEvent = function(type) {
    this.type = type;
  };

  tabris.StorageEvent.prototype = _.extendPrototype(tabris.DOMEvent, {
    bubbles: false,
    cancelable: false,
    key: "",
    oldValue: null,
    newValue: null,
    url: "",
    storageArea: null
  });

  if (!window.Storage) {
    window.Storage = tabris.WebStorage;
    window.localStorage = new tabris.WebStorage();
  }

}());
