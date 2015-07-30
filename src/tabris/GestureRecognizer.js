tabris.registerType("_GestureRecognizer", {

  _type: "tabris.GestureRecognizer",
  _properties: {
    type: "string",
    target: "proxy",
    fingers: "natural",
    touches: "natural",
    duration: "natural",
    direction: "string"
  },

  _events: {
    gesture: true
  }

});
