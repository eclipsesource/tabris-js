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
      items: {
        type: "array",
        default: function() {
          return [];
        },
        access: {
          set: function(name, value, options) {
            this._storeProperty(name, value, options);
            var getText = this.get("itemText");
            this._nativeSet("items", value.map(getText));
          }
        }
      },
      itemText: {
        type: "function",
        default: function() {
          return function(item) {
            return item == null ? "" : item.toString();
          };
        },
        access: {
          set: function(name, value, options) {
            this._storeProperty(name, value, options);
          }
        }
      },
      selectionIndex: {
        type: "natural",
        access: {
          set: function(name, value, options) {
            this._nativeSet(name, value);
            this._triggerChangeEvent(name, value, options);
          }
        }
      },
      selection: {
        access: {
          set: function(name, item, options) {
            var index = this._getItemIndex(item);
            if (index !== -1) {
              this.set("selectionIndex", index, options);
            } else {
              console.warn("Could not set picker selection " + item + ": item not found");
            }
          },
          get: function() {
            return this._getItem(this.get("selectionIndex"));
          }
        }
      }
    },

    _setProperties: function(properties, options) {
      // items property depends on itemText, selection/selectionIndex depend on items
      var deferred = ["items", "selection", "selectionIndex"];
      this._super("_setProperties", [_.omit(properties, deferred)].concat(_.drop(arguments)));
      deferred.forEach(function(name) {
        if (name in properties) {
          this._setProperty(name, properties[name], options);
        }
      }, this);
    },

    _getItem: function(index) {
      return this.get("items")[index];
    },

    _getItemIndex: function(item) {
      return this.get("items").indexOf(item);
    }

  });

  function triggerSelectionChange(widget, index, options) {
    widget._triggerChangeEvent("selection", widget._getItem(index), _.extend({index: index}, options));
  }

}());
