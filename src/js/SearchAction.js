tabris.registerType("SearchAction", {

  _type: "tabris.SearchAction",

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
    },
    proposals: true // array of strings
  },

  _listen: {selection: "Selection", modify: "Modify", submit: "Search"},

  _trigger: {Selection: "selection", Modify: "modify", Search: "submit"},

  _create: function(properties) {
    this.super("_create", properties);
    this._nativeSet("parent", tabris.ui.cid);
    return this;
  }

});
