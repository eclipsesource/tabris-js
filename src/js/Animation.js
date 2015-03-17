(function() {

  tabris.registerType("_Animation", {

    _type: "tabris.Animation",

    _create: function(properties) {
      tabris.Proxy.prototype._create.call(this, properties);
      this._nativeListen("Start", true);
      this._nativeListen("Completion", true);
      return this;
    },

    _events: {
      Start: {
        trigger: function() {
          this._target.trigger("animationstart", {options: this._options});
        }
      },
      Completion: {
        trigger: function() {
          this._target.trigger("animationend", {options: this._options});
          this.dispose();
        }
      }
    },

    _properties: {
      properties: {
        set: function(value) {
          var properties = {};
          for (var property in value) {
            if (animateable[property]) {
              properties[property] = value[property];
            } else {
              console.warn("Invalid animation property \"" + property + "\"");
            }
          }
          this._nativeSet("properties", properties);
        }
      },
      delay: "natural",
      duration: "natural",
      repeat: "natural",
      reverse: "boolean",
      easing: ["choice", ["linear", "ease-in", "ease-out", "ease-in-out"]],
      target: "proxy"
    },

    start: function() {
      this._nativeCall("start");
    },

    cancel: function() {
      this._nativeCall("cancel");
    }

  });

  tabris._Animation.animate = function(properties, options) {
    for (var option in options) {
      if (!tabris._Animation._properties[option] && option !== "name") {
        console.warn("Invalid animation option \"" + option + "\"");
      }
    }
    var animation = tabris.create("_Animation", util.extend({}, options, {
      target: this,
      properties: properties
    }));
    animation._target = this;
    animation._options = options;
    animation.start();
    return this;
  };

  var animateable = {
    opacity: true,
    transform: true
  };

}());
