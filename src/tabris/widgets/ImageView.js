import Widget from "../Widget";

tabris.ImageView = Widget.extend({
  _name: "ImageView",
  _type: "tabris.ImageView",
  _events: {
    load: {
      trigger: function(event) {
        this.trigger("load", this, event);
      }
    }
  },
  _properties: {
    image: {type: "image", default: null},
    scaleMode: {type: ["choice", ["auto", "fit", "fill", "stretch", "none"]], default: "auto"},
    tintColor: {
      type: "color",
      access: {
        set: function(name, value, options) {
          this._nativeSet(name, value === undefined ? null : value);
          this._storeProperty(name, value, options);
        }
      }
    }
  }
});
