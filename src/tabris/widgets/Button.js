import Widget from "../Widget";

tabris.Button = Widget.extend({
  _name: "Button",
  _type: "tabris.Button",
  _events: {
    select: {
      trigger: function(event) {
        this.trigger("select", this, event);
      }
    }
  },
  _properties: {
    alignment: {type: ["choice", ["left", "right", "center"]], default: "center"},
    image: {type: "image", default: null},
    text: {type: "string", default: ""}
  }
});
