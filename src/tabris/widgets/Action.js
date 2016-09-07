import Widget from "../Widget";

tabris.Action = Widget.extend({
  _name: "Action",

  _type: "tabris.Action",

  _properties: {
    image: {type: "image", default: null},
    placementPriority: {
      type: ["choice", ["low", "high", "normal"]],
      access: {
        set: function(name, value, options) {
          this._nativeSet(name, value.toUpperCase());
          this._storeProperty(name, value, options);
        }
      },
      default: "normal"
    },
    title: {type: "string", default: ""},
    win_symbol: {type: "string", default: ""}
  },

  _events: {
    select: {
      trigger: function(event) {
        this.trigger("select", this, event);
      }
    }
  },

  _create: function() {
    this._super("_create", arguments);
    tabris.ui.append(this);
    return this;
  }

});
