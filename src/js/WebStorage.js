(function() {

  tabris.registerType("_ClientStore", {
    _type: "tabris.ClientStore"
  });

  var proxy;

  tabris.WebStorage = function() {
    proxy = tabris("_ClientStore");
  };

  tabris.WebStorage.prototype = {
    // Note: key and length methods currently not supported

    setItem: function(key, value) {
      if (!key) {
        throw new TypeError("Key argument must be specified to execute 'setItem'");
      }
      if (!value) {
        throw new TypeError("Value argument must be specified to execute 'setItem'");
      }
      if (typeof key === "string" && typeof value === "string") {
        proxy._nativeCall("add", {key: key, value: value});
      }
    },

    getItem: function(key) {
      // Note: the client implementation should return "null" when the item was not found
      if (typeof key === "string") {
        return proxy._nativeCall("get", {key: key});
      }
    },

    removeItem: function(key) {
      if (typeof key === "string") {
        proxy._nativeCall("remove", {keys: [key]});
      }
    },

    clear: function() {
      proxy._nativeCall("clear");
    }

  };

  tabris.StorageEvent = function(type) {
    this.type = type;
  };

  tabris.StorageEvent.prototype = util.extendPrototype(tabris.DOMEvent, {
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
