/**
 * Copyright (c) 2014 EclipseSource.
 * All rights reserved.
 */

(function() {

  tabris._addDeviceMethods = function(target) {

    if (!("devicePixelRatio" in target)) {
      Object.defineProperty(target, "devicePixelRatio", {
        get: function() {
          return tabris("tabris.Device").get("scaleFactor");
        },
        set: function() {}
      });
    }

  };

  if (typeof window !== "undefined") {
    tabris._addDeviceMethods(window);
  }

})();
