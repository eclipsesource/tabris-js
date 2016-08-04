tabris.registerWidget("Canvas", {
  _type: "tabris.Canvas",
  _supportsChildren: true,
  getContext: function(type, width, height) {
    if (type === "2d") {
      return tabris.CanvasContext.getContext(this, width, height);
    }
    return null;
  }
});
