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
    proposals: {default: function() {return [];}},
    text: {
      type: "string",
      nocache: true,
      set: function(value) {
        this._nativeSet("query", value);
      },
      get: function() {
        return this._nativeGet("query");
      }
    }
  },

  _events: {
    input: {
      name: "Modify",
      listen: function(state) {
        this._nativeListen("Modify", state);
      },
      trigger: function(event) {
        this.trigger("input", this, event.query, {});
      }
    },
    accept: {
      name: "Search",
      trigger: function(event) {
        this.trigger("accept", this, event.query, {});
      }
    },
    select: {
      name: "Selection",
      trigger: function(event) {
        this.trigger("select", this, event);
      }
    }
  },

  _create: function(properties) {
    this.super("_create", properties);
    this._nativeSet("parent", tabris.ui.cid);
    return this;
  }

});
