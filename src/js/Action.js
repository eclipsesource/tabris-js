tabris.registerType("Action", {

  _type: "tabris.Action",

  _properties: {
    enabled: "boolean",
    foreground: true,
    image: "image",
    placementPriority: ["choice", {low: "LOW", high: "HIGH", normal: "NORMAL"}],
    title: "string",
    visible: "boolean"
  },

  _setProperty: {
    visible: function(value) {
      this._setPropertyNative("visibility", value);
    }
  },

  _getProperty: {
    visible: function() {
      return this._getPropertyNative("visibility");
    },
    placementPriority: function() {
      var value = this._getPropertyNative("placementPriority");
      return value ? value.toLowerCase() : value;
    }
  },

  _listen: {selection: "Selection"},

  _trigger: {
    Selection: function(params) { this.trigger("selection", params); }
  },

  _create: function(properties) {
    this.super("_create", properties);
    this._setPropertyNative("parent", tabris.ui.id);
    return this;
  }

});
