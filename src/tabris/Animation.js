import {extend} from "./util";

tabris.registerType("_Animation", {

  _type: "tabris.Animation",

  _create: function() {
    this._super("_create", arguments);
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
        this._target._off("dispose", this.abort, this);
        this._target.trigger("animationend", this._target, this._options);
        if (this._resolve) {
          this._resolve();
        }
        this.dispose();
      }
    }
  },

  _properties: {
    properties: "any",
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

  abort: function() {
    if (this._reject) {
      this._reject();
    }
    this.dispose();
  }

});

tabris._Animation.animate = function(properties, options) {
  var animatedProps = {};
  for (var property in properties) {
    if (animatable[property]) {
      try {
        animatedProps[property] =
          this._encodeProperty(this._getTypeDef(property), properties[property]);
        this._storeProperty(property, animatedProps[property], options);
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
  var animation = tabris.create("_Animation", extend({}, options, {
    target: this,
    properties: animatedProps
  }));
  animation._target = this;
  animation._options = options;
  this._on("dispose", animation.abort, animation);
  animation.start();
  return new Promise(function(resolve, reject) {
    animation._resolve = resolve;
    animation._reject = reject;
  });
};

var animatable = {
  opacity: true,
  transform: true
};
