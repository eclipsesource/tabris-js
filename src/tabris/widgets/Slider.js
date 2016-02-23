tabris.registerWidget("Slider", {
  _type: "rwt.widgets.Scale",
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
    minimum: {type: "integer", default: 0},
    maximum: {type: "integer", default: 100},
    selection: {type: "integer", nocache: true}
  }
});
