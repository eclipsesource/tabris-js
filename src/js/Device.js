(function() {

  tabris.registerType("_Device", {
    _type: "tabris.Device",
    _properties: true
  });

  tabris._publishDeviceProperties = function(target) {
    if (!("device" in target)) {
      var dev = createDeviceObject();
      var screen = createScreenObject();
      defineReadOnlyProperty(target, "device", fix(dev));
      defineReadOnlyProperty(dev, "screen", fix(screen));
      if (!("screen" in target)) {
        defineReadOnlyProperty(target, "screen", fix(screen));
      }
      if (("navigator" in target) && !("language" in target.navigator)) {
        defineReadOnlyProperty(target.navigator, "language", getDevicePropertyFn("language"));
      }
      if (!("devicePixelRatio" in target)) {
        defineReadOnlyProperty(target, "devicePixelRatio", getDevicePropertyFn("scaleFactor"));
      }
    }
  };

  if (typeof window !== "undefined") {
    tabris._publishDeviceProperties(window);
  }

  function createDeviceObject() {
    var dev = {};
    ["model", "platform", "version", "language", "scaleFactor"].forEach(function(name) {
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
      return tabris("_Device").get(name);
    };
  }

  function fix(value) {
    return function() {
      return value;
    };
  }

})();
