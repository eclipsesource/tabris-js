tabris.registerType("Action", {

  _type: "tabris.Action",

  _properties: {
    enabled: "boolean",
    foreground: "color",
    image: "image",
    placementPriority: {
      type: ["choice", {low: "LOW", high: "HIGH", normal: "NORMAL"}],
      get: function() {
        var value = this._nativeGet("placementPriority");
        return value ? value.toLowerCase() : value;
      }
    },
    title: "string",
    visible: {
      type: "boolean",
      set: function(value) {
        this._nativeSet("visibility", value);
      },
      get: function() {
        return this._nativeGet("visibility");
      }
    }
  },

  _events: {selection: "Selection"},

  _create: function(properties) {
    this.super("_create", properties);
    this._nativeSet("parent", tabris.ui.cid);
    return this;
  }

});
