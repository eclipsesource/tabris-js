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
          this._target.trigger("animationstart", this._target, this._options);
        }
      },
      Completion: {
        trigger: function() {
          this._target._off("dispose", this.dispose, this);
          this._target.trigger("animationend", this._target, this._options);
          this.dispose();
        }
      }
    },

    _properties: {
      properties: true,
      delay: "natural",
      duration: "natural",
      repeat: "natural",
      reverse: "boolean",
      easing: ["choice", ["linear", "ease-in", "ease-out", "ease-in-out"]],
      target: "proxy"
    },

    start: function() {
      this._nativeCall("start");
    }

  });

  tabris._Animation.animate = function(properties, options) {
    var animatedProps = {};
    for (var property in properties) {
      if (animatable[property]) {
        try {
          animatedProps[property] =
            this._encodeProperty(properties[property], this._getPropertyType(property));
          this._storeProperty(property, animatedProps[property]);
        } catch (ex) {
          console.warn(this.type + ": Ignored invalid animation property value for \"" + property + "\"");
        }
      } else {
        console.warn(this.type + ": Ignored invalid animation property \"" + property + "\"");
      }
    }
    for (var option in options) {
      if (!tabris._Animation._properties[option] && option !== "name") {
        console.warn(this.type + ": Ignored invalid animation option \"" + option + "\"");
      }
    }
    var animation = tabris.create("_Animation", _.extend({}, options, {
      target: this,
      properties: animatedProps
    }));
    animation._target = this;
    animation._options = options;
    this._on("dispose", animation.dispose, animation);
    animation.start();
  };

  var animatable = {
    opacity: true,
    transform: true
  };

}());
