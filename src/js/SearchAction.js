tabris.registerType("SearchAction", {

  _type: "tabris.SearchAction",

  _properties: {
    enabled: {type: "boolean", default: true},
    foreground: {type: "color", nocache: true},
    image: {type: "image", default: null},
    placementPriority: {
      type: ["choice", {low: "LOW", high: "HIGH", normal: "NORMAL"}],
      nocache: true,
      get: function() {
        var value = this._nativeGet("placementPriority");
        return value ? value.toLowerCase() : value;
      }
    },
    title: {type: "string", default: ""},
    visible: {
      type: "boolean",
      default: true,
      set: function(value) {
        this._nativeSet("visibility", value);
      }
    },
    proposals: {default: function() {return [];}}
  },

  _events: {selection: "Selection", modify: "Modify", submit: "Search"},

  _create: function(properties) {
    this.super("_create", properties);
    this._nativeSet("parent", tabris.ui.cid);
    return this;
  }

});
