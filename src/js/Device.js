(function() {

  tabris.registerType("_Device", {
    _type: "tabris.Device",
    _properties: true
  });

  tabris._addDeviceObject = function(target) {
    if (!("device" in target)) {
      var dev = {};
      ["model", "platform", "version", "language"].forEach(function(name) {
        defineReadOnlyProperty(dev, name, function() {
          return tabris("_Device").get(name);
        });
      });
      defineReadOnlyProperty(target, "device", function() {
        return dev;
      });
    }
  };

  tabris._addDevicePixelRatio = function(target) {
    if (!("devicePixelRatio" in target)) {
      defineReadOnlyProperty(target, "devicePixelRatio", function() {
        return tabris("_Device").get("scaleFactor");
      });
    }
  };

  tabris._addDeviceLanguage = function(target) {
    if (!("language" in target)) {
      defineReadOnlyProperty(target, "language", function() {
        return tabris("_Device").get("language");
      });
    }
  };

  function defineReadOnlyProperty(target, name, getter) {
    Object.defineProperty(target, name, {
      get: getter,
      set: function() {}
    });
  }

  if (typeof window !== "undefined") {
    tabris._addDeviceObject(window);
    tabris._addDevicePixelRatio(window);
  }
  if (typeof navigator !== "undefined") {
    tabris._addDeviceLanguage(navigator);
  }

})();
