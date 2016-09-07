import CanvasContext from "../CanvasContext";
import Widget from "../Widget";

tabris.Canvas = Widget.extend({
  _name: "Canvas",
  _type: "tabris.Canvas",
  _supportsChildren: true,
  getContext: function(type, width, height) {
    if (type === "2d") {
      return CanvasContext.getContext(this, width, height);
    }
    return null;
  }
});
