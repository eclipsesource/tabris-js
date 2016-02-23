tabris.registerWidget("Switch", {
  _type: "tabris.Switch",
  _events: {
    select: {
      name: "toggle",
      alias: "change:selection",
      trigger: function(event) {
        this._triggerChangeEvent("selection", event.checked);
        this.trigger("select", this, event.checked, {});
      }
    }
  },
  _properties: {
    selection: {
      type: "boolean",
      access: {
        get: function() {
          return this._nativeGet("checked");
        },
        set: function(name, value, options) {
          this._nativeSet("checked", value);
          this._triggerChangeEvent(name, value, options);
        }
      }
    },
    thumbOnColor: {
      type: "color"
    },
    thumbOffColor: {
      type: "color"
    },
    trackOnColor: {
      type: "color"
    },
    trackOffColor: {
      type: "color"
    }
  }

});
