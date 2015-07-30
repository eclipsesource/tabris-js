(function() {

  tabris.registerType("_Device", {
    _type: "tabris.Device",
    _properties: {
      model: true,
      platform: true,
      version: true,
      language: true,
      orientation: true,
      screenWidth: true,
      screenHeight: true,
      scaleFactor: true
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
      defineReadOnlyProperty(target, "device", fix(createDeviceObject()));
    }
    if (!("screen" in target)) {
      defineReadOnlyProperty(target, "screen", fix(createScreenObject()));
    }
    if (("navigator" in target) && !("language" in target.navigator)) {
      defineReadOnlyProperty(target.navigator, "language", getDevicePropertyFn("language"));
    }
    if (!("devicePixelRatio" in target)) {
      defineReadOnlyProperty(target, "devicePixelRatio", getDevicePropertyFn("scaleFactor"));
    }
  };

  tabris.device = tabris("_Device");

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

  function fix(value) {
    return function() {
      return value;
    };
  }

})();
