tabris.registerWidget("CollectionView", {

  _type: "tabris.CollectionView",

  _supportsChildren: function(child) {
    return child instanceof tabris.Cell;
  },

  _properties: {
    itemHeight: {
      type: "any", // "function|natural",
      default: 0,
      access: {
        set: function(name, value, options) {
          if (typeof value !== "function") {
            // Required for 1.0 compatibility
            this._nativeSet("itemHeight", value);
          }
          this._storeProperty(name, value, options);
        }
      }
    },
    items: {
      type: "array",
      access: {
        set: function(name, value, options) {
          this._setItems(value, options);
        },
        get: function() {
          return this._items;
        }
      }
    },
    initializeCell: {
      type: "function",
      default: null,
      access: {
        set: function(name, value) {
          this._storeProperty(name, value);
        }
      }
    },
    cellType: {
      type: "any", // "string|function",
      default: null,
      access: {
        set: function(name, value, options) {
          this._storeProperty(name, value, options);
        }
      }
    },
    refreshEnabled: {type: "boolean", default: false},
    refreshIndicator: {type: "boolean", nocache: true},
    refreshMessage: {type: "string", default: ""},
    firstVisibleIndex: {
      type: "number",
      access: {
        set: function(name) {
          console.warn(this.type + ": Cannot set read-only property '" + name + "'.");
        }
      }
    },
    lastVisibleIndex: {
      type: "number",
      access: {
        set: function(name) {
          console.warn(this.type + ": Cannot set read-only property '" + name + "'.");
        }
      }
    },
    columnCount: {
      type: "number",
      default: 1
    }
  },

  _create: function() {
    this._items = [];
    var result = this._super("_create", arguments);
    this._nativeListen("requestinfo", true);
    this._nativeListen("createitem", true);
    this._nativeListen("populateitem", true);
    // TODO call _reload on flush
    this._reload();
    return result;
  },

  set: function() {
    var result = this._super("set", arguments);
    // TODO call _reload on flush, remove override
    this._reload();
    return result;
  },

  _events: {
    refresh: {
      trigger: function(event) {this.trigger("refresh", this, event);}
    },
    requestinfo: {
      trigger: function(event) {
        var item = this._getItem(this._items, event.index);
        var type = resolveProperty(this, "cellType", item);
        var height = resolveProperty(this, "itemHeight", item, type);
        var typeId = encodeCellType(this, type);
        this._nativeCall("describeItem", {index: event.index, type: typeId, height: height});
      }
    },
    createitem: {
      trigger: function(event) {
        var cell = new tabris.Cell();
        cell._parent = this;
        this._addChild(cell);
        this._nativeCall("addItem", {widget: cell.cid});
        var initializeCell = this.get("initializeCell");
        if (typeof initializeCell !== "function") {
          console.warn("initializeCell callback missing");
        } else {
          initializeCell(cell, decodeCellType(this, event.type));
        }
      }
    },
    populateitem: {
      trigger: function(event) {
        var cell = tabris._proxies.find(event.widget);
        var item = this._getItem(this._items, event.index);
        cell._storeProperty("itemIndex", event.index);
        if (item !== cell._getStoredProperty("item")) {
          cell._storeProperty("item", item);
        } else {
          cell.trigger("change:item", cell, item, {});
        }
      }
    },
    select: {
      listen: function(state) {
        this._nativeListen("select", state);
      },
      trigger: function(event) {
        var item = this._getItem(this._items, event.index);
        this.trigger("select", this, item, {index: event.index});
      }
    },
    scroll: {
      trigger: function(event) {
        this.trigger("scroll", this, event);
      }
    },
    "change:firstVisibleIndex": {
      listen: function(state) {
        if (state) {
          this.on("scroll", triggerChangeFirstVisibleIndex);
        } else {
          this.off("scroll", triggerChangeFirstVisibleIndex);
        }
      }
    },
    "change:lastVisibleIndex": {
      listen: function(state) {
        if (state) {
          this.on("scroll", triggerChangeLastVisibleIndex);
        } else {
          this.off("scroll", triggerChangeLastVisibleIndex);
        }
      }
    }
  },

  _setItems: function(items, options) {
    this._items = items || [];
    this._triggerChangeEvent("items", this._items, options);
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
    this._adjustIndicies(index, items.length);
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
      this._adjustIndicies(index + count, -count);
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
  },

  _adjustIndicies: function(offset, diff) {
    var cells = this._children || [];
    for (var i = 0; i < cells.length; i++) {
      var cell = cells[i];
      var itemIndex = cell._getStoredProperty("itemIndex");
      if (itemIndex >= offset) {
        cell._storeProperty("itemIndex", itemIndex + diff);
      }
    }
  }

});

function resolveProperty(ctx, name) {
  var value = ctx.get(name);
  if (typeof value === "function") {
    return value.apply(null, Array.prototype.slice.call(arguments, 2));
  }
  return value;
}

function encodeCellType(ctx, type) {
  var cellTypes = ctx._cellTypes || (ctx._cellTypes = []);
  var index = cellTypes.indexOf(type);
  if (index === -1) {
    index += cellTypes.push(type);
  }
  return index;
}

function decodeCellType(ctx, type) {
  var cellTypes = ctx._cellTypes || [];
  return cellTypes[type];
}

var triggerChangeFirstVisibleIndex = createDelegate("firstVisibleIndex");
var triggerChangeLastVisibleIndex = createDelegate("lastVisibleIndex");

function createDelegate(prop) {
  return function() {
    var actual = this.get(prop);
    if (actual !== this["_prev:" + prop]) {
      this._triggerChangeEvent(prop, actual);
    }
    this["_prev:" + prop] = actual;
  };
}

tabris.registerWidget("Cell", {

  _type: "tabris.Composite",

  _supportsChildren: true,

  dispose: function() {
    console.warn("CollectionView cells are container-managed, they cannot be disposed of");
  },

  _properties: {
    item: {
      access: {
        set: function() {
          // read only
        },
        get: function(name) {
          return this._getStoredProperty(name);
        }
      }
    },
    itemIndex: {
      access: {
        set: function() {
          // read only
        },
        get: function(name) {
          return this._getStoredProperty(name);
        }
      }
    }
  }

});
