/**
 * Copyright (c) 2014 EclipseSource.
 * All rights reserved.
 */

(function() {

  tabris.registerWidget("CollectionView", {

    _type: "tabris.CollectionView",

    _checkProperty: {
      itemHeight: true,
      items: true,
      initializeCell: true
    },

    _create: function() {
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
      },
    },

    _getProperty: {
      items: function() {
        return this._items || [];
      }
    },

    _listen: {
      selection: true
    },

    _trigger: {
      createitem: function() {
        var cell = tabris.create("_CollectionCell", {});
        this.call("addItem", {widget: cell.id});
        if (typeof this._initializeCell !== "function") {
          console.warn("initializeCell callback missing");
        } else {
          this._initializeCell(cell);
        }
      },
      populateitem: function(event) {
        var cell = tabris(event.widget);
        var item = this._items ? this._items[event.index] : null;
        cell.trigger("itemchange", item, event.index);
      },
      selection: function(event) {
        this.trigger("selection", {
          index: event.index,
          item: this._items ? this._items[event.index] : null
        });
      }
    },

    _setItems: function(items) {
      var oldItemCount = this._items ? this._items.length : 0;
      this._items = items;
      var updateOperations = {};
      if (oldItemCount > 0) {
        updateOperations.remove = [0, oldItemCount];
      }
      var newItemCount = items ? items.length : 0;
      if (newItemCount > 0) {
        updateOperations.insert = [0, newItemCount];
      }
      if (Object.keys(updateOperations).length) {
        this._updateOperations = updateOperations;
      }
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
