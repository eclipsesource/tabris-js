tabris.registerType("SearchAction", {

  _type: "tabris.SearchAction",

  _properties: {
    enabled: "boolean",
    foreground: "color",
    image: "image",
    placementPriority: ["choice", {low: "LOW", high: "HIGH", normal: "NORMAL"}],
    title: "string",
    visible: "boolean",
    proposals: true // array of strings
  },

  _setProperty: {
    visible: function(value) {
      this._nativeSet("visibility", value);
    }
  },

  _getProperty: {
    visible: function() {
      return this._nativeGet("visibility");
    },
    placementPriority: function() {
      var value = this._nativeGet("placementPriority");
      return value ? value.toLowerCase() : value;
    }
  },

  _listen: {selection: "Selection", modify: "Modify", submit: "Search"},

  _trigger: {Selection: "selection", Modify: "modify", Search: "submit"},

  _create: function(properties) {
    this.super("_create", properties);
    this._nativeSet("parent", tabris.ui.id);
    return this;
  }

});
