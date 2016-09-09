import Widget from "../Widget";
import TabFolder from "./TabFolder";

export default Widget.extend({
  _name: "Tab",

  _type: "tabris.Tab",

  _properties: {
    title: {type: "string", default: ""},
    image: {type: "image", default: null},
    selectedImage: {type: "image", default: null},
    badge: {type: "string", default: ""}
  },

  _supportsChildren: true,

  _setParent: function(parent) {
    if (!(parent instanceof TabFolder)) {
      throw new Error("Tab must be a child of TabFolder");
    }
    Widget.prototype._setParent.call(this, parent);
  }
});
