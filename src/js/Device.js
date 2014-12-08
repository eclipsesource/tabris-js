/**
 * Copyright (c) 2014 EclipseSource.
 * All rights reserved.
 */

(function() {

  tabris.registerType("_Device", {
    _type: "tabris.Device",
    _properties: true
  });

  tabris._addDeviceObject = function(target) {
    if (!("device" in target)) {
      var dev = {};
      ["model", "platform", "version"].forEach(function(name) {
        defineReadOnlyProperty(dev, name, function() {
          return tabris("_Device").get(name);
        });
      });
      defineReadOnlyProperty(target, "device", function() {
        return dev;
      });
    }
  };

  tabris._addDeviceMethods = function(target) {
    if (!("devicePixelRatio" in target)) {
      defineReadOnlyProperty(target, "devicePixelRatio", function() {
        return tabris("_Device").get("scaleFactor");
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
    tabris._addDeviceMethods(window);
  }

})();
