tabris.registerWidget("ImageView", {
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
    scaleMode: {type: ["choice", ["auto", "fit", "fill", "stretch", "none"]], default: "auto"}
  }
});
