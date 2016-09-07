import Proxy from "./Proxy";

tabris._GestureRecognizer = Proxy.extend({
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
