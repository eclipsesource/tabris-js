tabris.registerWidget("ToggleButton", {
  _type: "rwt.widgets.Button",
  _initProperties: {style: ["TOGGLE"]},
  _events: {
    select: {
      name: "Selection",
      alias: "change:selection",
      trigger: function(event) {
        this._triggerChangeEvent("selection", event.selection);
        this.trigger("select", this, event.selection, {});
      }
    }
  },
  _properties: {
    text: {type: "string", default: ""},
    image: {type: "image", default: null},
    selection: {type: "boolean", nocache: true},
    alignment: {type: ["choice", ["left", "right", "center"]], default: "center"}
  }
});
