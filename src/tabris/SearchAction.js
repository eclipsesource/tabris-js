tabris.registerType("SearchAction", {

  _type: "tabris.SearchAction",

  _properties: {
    enabled: {type: "boolean", default: true},
    foreground: {type: "color", nocache: true},
    image: {type: "image", default: null},
    placementPriority: {
      type: ["choice", {low: "LOW", high: "HIGH", normal: "NORMAL"}],
      nocache: true,
      access: {
        get: function() {
          var value = this._nativeGet("placementPriority");
          return value ? value.toLowerCase() : value;
        }
      }
    },
    title: {type: "string", default: ""},
    visible: {
      type: "boolean",
      default: true,
      access: {
        set: function(name, value, options) {
          this._nativeSet("visibility", value);
          this._storeProperty(name, value, options);
        }
      }
    },
    proposals: {default: function() {return [];}},
    text: {
      type: "string",
      access: {
        set: function(name, value, options) {
          this._nativeSet("query", value);
          this._triggerChangeEvent(name, value, options);
        },
        get: function() {
          return this._nativeGet("query");
        }
      }
    },
    message: {type: "string", default: ""}
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
