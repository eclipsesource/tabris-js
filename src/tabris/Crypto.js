(function() {

  tabris.registerType("_Crypto", {
    _type: "tabris.Crypto"
  });

  var proxy;

  tabris.Crypto = function() {
    proxy = new tabris._Crypto();
  };

  tabris.Crypto.prototype = {

    getRandomValues: function(typedArray) {
      if (arguments.length === 0) {
        throw new Error("Not enough arguments to Crypto.getRandomValues");
      }
      if (!isIntArray(typedArray)) {
        throw new Error("Unsupported type in Crypto.getRandomValues");
      }
      var byteLength = typedArray.byteLength;
      var values = proxy._nativeCall("getRandomValues", {byteLength: byteLength});
      if (values.length !== byteLength) {
        throw new Error("wrong number of random bytes");
      }
      new Uint8Array(typedArray.buffer).set(values);
    }

  };

  tabris.load(function () {
    if (!window.crypto) {
      window.crypto = new tabris.Crypto();
    }
  });

  function isIntArray(value) {
    return (value instanceof Int8Array) ||
           (value instanceof Uint8Array) ||
           (value instanceof Uint8ClampedArray) ||
           (value instanceof Int16Array) ||
           (value instanceof Uint16Array) ||
           (value instanceof Int32Array) ||
           (value instanceof Uint32Array);
  }

}());
