import Widget from "../Widget";

tabris.Slider = Widget.extend({
  _name: "Slider",
  _type: "tabris.Slider",
  _events: {
    select: {
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
