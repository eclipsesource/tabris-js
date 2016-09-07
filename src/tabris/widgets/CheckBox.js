import Widget from "../Widget";

tabris.CheckBox = Widget.extend({
  _name: "CheckBox",
  _type: "tabris.CheckBox",
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
    text: {type: "string", default: ""},
    selection: {type: "boolean", nocache: true}
  }
});
