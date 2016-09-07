import Widget from "../Widget";

tabris.Switch = Widget.extend({
  _name: "Switch",
  _type: "tabris.Switch",
  _events: {
    select: {
      alias: "change:selection",
      trigger: function(event) {
        this.trigger("change:selection", this, event.selection, {});
        this.trigger("select", this, event.selection, {});
      }
    }
  },
  _properties: {
    selection: {type: "boolean", nocache: true},
    thumbOnColor: {type: "color"},
    thumbOffColor: {type: "color"},
    trackOnColor: {type: "color"},
    trackOffColor: {type: "color"}
  }
});
