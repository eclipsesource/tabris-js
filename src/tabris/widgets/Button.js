tabris.registerWidget("Button", {
  _type: "rwt.widgets.Button",
  _initProperties: {style: ["PUSH"]},
  _events: {
    select: {
      name: "Selection",
      listen: function(state) {
        this._nativeListen("Selection", state);
      },
      trigger: function(event) {
        this.trigger("select", this, event);
      }
    }
  },
  _properties: {
    alignment: {type: ["choice", ["left", "right", "center"]], default: "center"},
    image: {type: "image", default: null},
    text: {type: "string", default: ""}
  }
});
