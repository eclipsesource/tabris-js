tabris.registerWidget("ImageView", {
  _type: "tabris.ImageView",
  _properties: {
    image: {type: "image", default: null},
    scaleMode: {type: ["choice", ["auto", "fit", "fill", "stretch", "none"]], default: "auto"}
  }
});
