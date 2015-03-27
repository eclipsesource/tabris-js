(function() {

  tabris.registerWidget("CollectionView", {

    _type: "tabris.CollectionView",

    _properties: {
      itemHeight: "natural",
      items: {
        set: function(value) {
          this._setItems(value);
        },
        get: function() {
          return this._items.concat();
        },
        nocache: true
      },
      initializeCell: {
        set: function(value) {
          this._initializeCell = value;
        }
      },
      refreshEnabled: "boolean",
      refreshIndicator: "boolean",
      refreshMessage: "string"
    },

    _create: function() {
      this._items = [];
      var result = tabris.Proxy.prototype._create.apply(this, arguments);
      this._nativeListen("createitem", true);
      this._nativeListen("populateitem", true);
      // TODO call _reload on flush
      this._reload();
      return result;
    },

    set: function() {
      var result = tabris.Proxy.prototype.set.apply(this, arguments);
      // TODO call _reload on flush, remove override
      this._reload();
      return result;
    },

    _events: {
      refresh: true,
      createitem: {
        trigger: function() {
          var cell = tabris.create("_CollectionCell", {});
          this._nativeCall("addItem", {widget: cell.cid});
          if (typeof this._initializeCell !== "function") {
            console.warn("initializeCell callback missing");
          } else {
            this._initializeCell(cell);
          }
        }
      },
      populateitem: {
        trigger: function(event) {
          var cell = tabris(event.widget);
          var item = this._getItem(this._items, event.index);
          cell.trigger("itemchange", item, event.index);
        }
      },
      selection: {
        trigger: function(event) {
          this.trigger("selection", {
            index: event.index,
            item: this._getItem(this._items, event.index)
          });
        }
      }
    },

    _setItems: function(items) {
      this._items = items ? items.concat() : [];
      this._needsReload = true;
    },

    _getItem: function(items, index) {
      return items[index];
    },

    reveal: function(index) {
      index = this._checkIndex(index);
      if (index >= 0 && index < this._items.length) {
        this._nativeCall("reveal", {index: index});
      }
    },

    refresh: function(index) {
      if (arguments.length === 0) {
        this._nativeCall("update", {reload: [0, this._items.length]});
        return;
      }
      index = this._checkIndex(index);
      if (index >= 0 && index < this._items.length) {
        this._nativeCall("update", {reload: [index, 1]});
      }
    },

    insert: function(items, index) {
      if (!Array.isArray(items)) {
        throw new Error("items is not an array");
      }
      if (arguments.length === 1) {
        index = this._items.length;
      } else {
        index = Math.max(0, Math.min(this._items.length, this._checkIndex(index)));
      }
      Array.prototype.splice.apply(this._items, [index, 0].concat(items));
      this._nativeCall("update", {insert: [index, items.length]});
    },

    remove: function(index, count) {
      index = this._checkIndex(index);
      if (arguments.length === 1) {
        count = 1;
      } else if (typeof count === "number" && isFinite(count) && count >= 0) {
        count = Math.min(count, this._items.length - index);
      } else {
        throw new Error("illegal remove count");
      }
      if (index >= 0 && index < this._items.length && count > 0) {
        this._items.splice(index, count);
        this._nativeCall("update", {remove: [index, count]});
      }
    },

    _reload: function() {
      // We defer the reload call until the end of create/set in order to ensure that
      // we don't receive events before the listeners are attached
      if (this._needsReload) {
        this._nativeCall("reload", {"items": this._items.length});
        delete this._needsReload;
      }
    },

    _checkIndex: function(index) {
      if (typeof index !== "number" || !isFinite(index)) {
        throw new Error("illegal index");
      }
      return index < 0 ? index + this._items.length : index;
    }

  });

  tabris.registerWidget("_CollectionCell", {

    _type: "rwt.widgets.Composite",

    _supportsChildren: true,

    dispose: function() {
      console.warn("CollectionView cells are container-managed, they cannot be disposed of");
    }

  });

})();
