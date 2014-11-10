/**
 * Copyright (c) 2014 EclipseSource.
 * All rights reserved.
 */

(function() {

  tabris.registerType("_Device", {
    _type: "tabris.Device",
    _checkProperty: true
  });

  tabris._addDeviceMethods = function(target) {

    if (!("devicePixelRatio" in target)) {
      Object.defineProperty(target, "devicePixelRatio", {
        get: function() {
          return tabris("_Device").get("scaleFactor");
        },
        set: function() {}
      });
    }

  };

  if (typeof window !== "undefined") {
    tabris._addDeviceMethods(window);
  }

})();
