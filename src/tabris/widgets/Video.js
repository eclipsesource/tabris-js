var readOnly = {
  set: function(name) {
    console.warn("Can not set read-only property \"" + name + "\"");
  }
};

tabris.registerWidget("Video", {

  _type: "tabris.widgets.Video",

  _properties: {
    url: {type: "string", default: ""},
    controlsVisible: {type: "boolean", default: true},
    autoPlay: {type: "boolean", default: true},
    speed: {access: readOnly},
    position: {access: readOnly},
    duration: {access: readOnly},
    state: {access: readOnly}
  },

  _events: {
    "change:state": {
      name: "statechange",
      trigger: function(event) {
        this._triggerChangeEvent("state", event.state);
      }
    }
  },

  pause: function() {
    this._nativeCall("pause");
  },

  play: function(speed) {
    this._nativeCall("play", {
      speed: arguments.length > 0 ? tabris.PropertyTypes.number.encode(speed) : 1
    });
  },

  seek: function(position) {
    this._nativeCall("seek", {position: tabris.PropertyTypes.number.encode(position)});
  }

});
