(function() {

  tabris.registerType("_Device", {
    _cid: "tabris.Device",
    _properties: {
      model: "any",
      platform: "any",
      version: "any",
      language: "any",
      orientation: "any",
      screenWidth: "any",
      screenHeight: "any",
      scaleFactor: "any"
    },
    _setProperty: function() {},
    _events: {
      "change:orientation": {
        name: "orientationchange",
        trigger: function(event) {
          this._triggerChangeEvent("orientation", event.orientation);
        }
      }
    },
    dispose: function() {
      throw new Error("cannot dispose device object");
    }
  });

  tabris._publishDeviceProperties = function(target) {
    if (!("device" in target)) {
      target.device = createDeviceObject();
    }
    if (!("screen" in target)) {
      target.screen = createScreenObject();
    }
    if (("navigator" in target) && !("language" in target.navigator)) {
      defineReadOnlyProperty(target.navigator, "language", getDevicePropertyFn("language"));
    }
    if (!("devicePixelRatio" in target)) {
      target.devicePixelRatio = tabris.device.get("scaleFactor");
    }
  };

  tabris.device = new tabris._Device();

  if (typeof window !== "undefined") {
    tabris._publishDeviceProperties(window);
  }

  function createDeviceObject() {
    var dev = {};
    ["model", "platform", "version"].forEach(function(name) {
      defineReadOnlyProperty(dev, name, getDevicePropertyFn(name));
    });
    return dev;
  }

  function createScreenObject() {
    var screen = {};
    defineReadOnlyProperty(screen, "width", getDevicePropertyFn("screenWidth"));
    defineReadOnlyProperty(screen, "height", getDevicePropertyFn("screenHeight"));
    return screen;
  }

  function defineReadOnlyProperty(target, name, getter) {
    Object.defineProperty(target, name, {
      get: getter,
      set: function() {}
    });
  }

  function getDevicePropertyFn(name) {
    return function() {
      return tabris.device.get(name);
    };
  }

})();
