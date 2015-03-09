(function() {

  tabris.registerType("_Animation", {
    _type: "tabris.Animation",
    _events: {
      completion: "Completion",
      start: "Start"
    },
    _properties: {
      properties: true,
      delay: true,
      duration: true,
      repeat: true,
      reverse: true,
      easing: true,
      target: "proxy"
    }
  });

  tabris.Animation = function(target, properties, options) {
    var validatedOptions = {};
    var validatedProperties = {};
    for (var option in options) {
      if (validOptions[option]) {
        validatedOptions[option] = options[option];
      } else {
        console.warn("Invalid animation option \"" + option + "\"");
      }
    }
    for (var property in properties) {
      if (validProperties[property]) {
        validatedProperties[property] = properties[property];
      } else {
        console.warn("Invalid animation property \"" + property + "\"");
      }
    }
    this._target = target;
    // TODO: check/encode properties with PropertyEncoding.js
    this._properties = validatedProperties;
    this._options = validatedOptions;
  };

  util.extend(tabris.Animation.prototype, tabris.Events, {

    _start: function() {
      var animation = this;
      this._proxy = tabris.create("_Animation", util.extend(this._options, {
        target: this._target,
        properties: this._properties
      }));
      this._proxy._listen("completion", true);
      var animation = this;
      this._proxy.trigger = function() {
        animation.trigger.apply(animation, arguments);
        if (arguments[0] === "completion") {
          this.dispose();
          delete animation._proxy;
        }
      };
      this._proxy._nativeCall("start");
    },

    cancel: function() {
      if (this._proxy) {
        this._proxy._nativeCall("cancel");
      }
    },

    _listen: function(type) {
      if (type !== "completion" && this._proxy) {
        this._proxy._listen.apply(this._proxy, arguments);
      }
    }

  });

  tabris.Animation.animate = function(properties, options) {
    var animation = new tabris.Animation(this, properties, options);
    animation._start();
    return animation;
  };

  var validOptions = {
    delay: true,
    duration: true,
    repeat: true,
    reverse: true,
    easing: true
  };

  var validProperties = {
    opacity: true,
    transform: true
  };

}());
