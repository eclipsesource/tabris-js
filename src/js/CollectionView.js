(function() {

  tabris.registerWidget("CollectionView", {

    _type: "tabris.CollectionView",

    _properties: {
      itemHeight: "natural",
      items: true,
      initializeCell: true,
      refreshEnabled: "boolean",
      refreshIndicator: "boolean",
      refreshMessage: "string"
    },

    _create: function() {
      this._items = [];
      var result = tabris.Proxy.prototype._create.apply(this, arguments);
      this._nativeListen("createitem", true);
      this._nativeListen("populateitem", true);
      this._update();
      return result;
    },

    set: function() {
      var result = tabris.Proxy.prototype.set.apply(this, arguments);
      this._update();
      return result;
    },

    _setProperty: {
      items: function(value) {
        this._setItems(value);
      },
      initializeCell: function(value) {
        this._initializeCell = value;
      }
    },

    _getProperty: {
      items: function() {
        return this._items.concat();
      }
    },

    _listen: {
      selection: true,
      refresh: true
    },

    _trigger: {
      createitem: function() {
        var cell = tabris.create("_CollectionCell", {});
        this.call("addItem", {widget: cell.cid});
        if (typeof this._initializeCell !== "function") {
          console.warn("initializeCell callback missing");
        } else {
          this._initializeCell(cell);
        }
      },
      populateitem: function(event) {
        var cell = tabris(event.widget);
        var item = this._getItem(this._items, event.index);
        cell.trigger("itemchange", item, event.index);
      },
      selection: function(event) {
        this.trigger("selection", {
          index: event.index,
          item: this._getItem(this._items, event.index)
        });
      }
    },

    _setItems: function(items) {
      var oldItemCount = this._items.length;
      this._items = items ? items.concat() : [];
      var updateOperations = {};
      if (oldItemCount > 0) {
        updateOperations.remove = [0, oldItemCount];
      }
      var newItemCount = this._items.length;
      if (newItemCount > 0) {
        updateOperations.insert = [0, newItemCount];
      }
      if (Object.keys(updateOperations).length) {
        this._updateOperations = updateOperations;
      }
    },

    _getItem: function(items, index) {
      return items[index];
    },

    refresh: function(index) {
      if (arguments.length === 0) {
        this.call("update", {reload: [0, this._items.length]});
        return;
      }
      if (typeof index !== "number" || !isFinite(index)) {
        throw new Error("Illegal index");
      }
      if (index < 0) {
        index += this._items.length;
      }
      if (this._items[index]) {
        this.call("update", {reload: [index, 1]});
      }
    },

    _insert: function(items) {
      var length = this._items.length;
      Array.prototype.push.apply(this._items, items);
      this.call("update", {insert: [length, items.length]});
    },

    _remove: function(start, count) {
      this._items.splice(start, count);
      this.call("update", {remove: [start, count]});
    },

    _update: function() {
      // We defer the update call until the end of create/set in order to ensure that
      // we don't receive events before the listeners are attached
      if (this._updateOperations) {
        this.call("update", this._updateOperations);
        delete this._updateOperations;
      }
    }

  });

  tabris.registerWidget("_CollectionCell", {

    _type: "rwt.widgets.Composite",

    _listen: {itemchange: function() {}},

    _supportsChildren: true,

    dispose: function() {
      console.warn("CollectionView cells are container-managed, they cannot be disposed of");
    }

  });

})();
