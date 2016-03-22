tabris.registerWidget("RadioButton", {
  _type: "rwt.widgets.Button",
  _initProperties: {style: ["RADIO"]},
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
    selection: {type: "boolean", nocache: true}
  }
});
