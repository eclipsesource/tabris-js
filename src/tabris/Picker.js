(function() {

  tabris.registerWidget("Picker", {

    _type: "rwt.widgets.Combo",

    _initProperties: {selectionIndex: 0},

    _events: {
      select: {
        name: "Selection",
        alias: "change:selectionIndex",
        trigger: function(event) {
          this._triggerChangeEvent("selectionIndex", event.selectionIndex);
          this.trigger("select", this, this._getItem(event.selectionIndex), {index: event.selectionIndex});
        }
      },
      "change:selection": {
        listen: function(state) {
          if (state) {
            this._on("change:selectionIndex", triggerSelectionChange);
          } else {
            this._off("change:selectionIndex", triggerSelectionChange);
          }
        }
      }
    },

    _properties: {
      items: {type: ["array", "string"], default: function() {return [];}},
      selectionIndex: {type: "natural", nocache: true},
      selection: {
        nocache: true,
        set: function(name, item) {
          var index = this._getItemIndex(item);
          if (index !== -1) {
            this.set("selectionIndex", index);
          } else {
            console.warn("Could not set picker selection " + item + ": item not found");
          }
        },
        get: function() {
          return this._getItem(this.get("selectionIndex"));
        }
      }
    },

    _setProperties: function(properties, options) {
      if ("items" in properties) {
        this._setProperty("items", properties.items, options);
      }
      this.super("_setProperties", properties, options);
    },

    _getItem: function(index) {
      return this.get("items")[index];
    },

    _getItemIndex: function(item) {
      return this.get("items").indexOf(item);
    }

  });

  function triggerSelectionChange(widget, index) {
    widget._triggerChangeEvent("selection", widget._getItem(index), {index: index});
  }

}());
