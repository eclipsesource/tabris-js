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
      proxy._nativeCall("add", {
        key: tabris.PropertyEncoding.string(key),
        value: tabris.PropertyEncoding.string(value)
      });
    },

    getItem: function(key) {
      // Note: the client implementation should return "null" when the item was not found
      return proxy._nativeCall("get", {key: tabris.PropertyEncoding.string(key)});
    },

    removeItem: function(key) {
      proxy._nativeCall("remove", {keys: [tabris.PropertyEncoding.string(key)]});
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
