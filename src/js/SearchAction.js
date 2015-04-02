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

  _events: {
    input: {
      name: "Modify",
      alias: "modify",
      listen: function(state, alias) {
        this._nativeListen("Modify", state);
        if (alias) {
          console.warn("SearchAction event \"modify\" is deprecated, use \"input\"");
        }
      },
      trigger: function(event) {
        this.trigger("input", this, event.query, {});
        this.trigger("modify", this, event, {});
      }
    },
    accept: {
      name: "Search",
      alias: "submit",
      listen: function(state, alias) {
        this._nativeListen("Search", state);
        if (alias) {
          console.warn("SearchAction event \"submit\" is deprecated, use \"accept\"");
        }
      },
      trigger: function(event) {
        this.trigger("accept", this, event.query, {});
        this.trigger("submit", this, event, {});
      }
    },
    select: {
      name: "Selection",
      alias: "selection",
      listen: function(state, alias) {
        this._nativeListen("Selection", state);
        if (alias) {
          console.warn("Action event \"selection\" is deprecated, use \"select\"");
        }
      },
      trigger: function(event) {
        this.trigger("select", this, event);
        this.trigger("selection", this, event);
      }
    }
  },

  _create: function(properties) {
    this.super("_create", properties);
    this._nativeSet("parent", tabris.ui.cid);
    return this;
  }

});
