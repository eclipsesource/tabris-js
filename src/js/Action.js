tabris.registerWidget("Action", {

  _type: "tabris.Action",

  _properties: {
    image: {type: "image", default: null},
    placementPriority: {
      type: ["choice", {low: "LOW", high: "HIGH", normal: "NORMAL"}],
      get: function() {
        var value = this._nativeGet("placementPriority");
        return value ? value.toLowerCase() : value;
      },
      nocache: true
    },
    title: {type: "string", default: ""}
  },

  _events: {
    select: {
      name: "Selection",
      listen: function(state) {
        this._nativeListen("Selection", state);
      },
      trigger: function(event) {
        this.trigger("select", this, event);
      }
    }
  },

  _create: function(properties) {
    this.super("_create", properties);
    tabris.ui.append(this);
    return this;
  }

});
