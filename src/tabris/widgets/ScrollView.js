import Widget from "../Widget";

export default Widget.extend({

  _name: "ScrollView",

  _type: "tabris.ScrollView",

  _supportsChildren: true,

  _properties: {
    direction: {
      type: ["choice", ["horizontal", "vertical"]],
      default: "vertical"
    },
    offsetX: {type: "number", nocache: true},
    offsetY: {type: "number", nocache: true}
  },

  _events: {
    scrollX: {
      alias: "change:offsetX",
      trigger: function(offset) {
        this._triggerChangeEvent("offsetX", offset);
        this.trigger("scrollX", this, offset, {});
      }
    },
    scrollY: {
      alias: "change:offsetY",
      trigger: function(offset) {
        this._triggerChangeEvent("offsetY", offset);
        this.trigger("scrollY", this, offset, {});
      }
    }
  },

  scrollToY: function(offsetY) {
    this._nativeCall("scrollToY", {offsetY: offsetY});
  },

  scrollToX: function(offsetX) {
    this._nativeCall("scrollToX", {offsetX: offsetX});
  }

});
