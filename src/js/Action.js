tabris.registerWidget("Action", {

  _type: "tabris.Action",

  _properties: {
    image: "image",
    placementPriority: {
      type: ["choice", {low: "LOW", high: "HIGH", normal: "NORMAL"}],
      get: function() {
        var value = this._nativeGet("placementPriority");
        return value ? value.toLowerCase() : value;
      }
    },
    title: "string"
  },

  _events: {selection: "Selection"},

  _create: function(properties) {
    this.super("_create", properties);
    tabris.ui.append(this);
    return this;
  }

});
