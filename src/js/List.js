/**
 * Copyright (c) 2014 EclipseSource.
 * All rights reserved.
 */

(function() {

  tabris.registerType("List", {

    _type: "rwt.widgets.Grid",

    _create: function(properties) {
      this.super("_create", util.extend({style: ["V_SCROLL"]}, properties));
      tabris.create("ScrollBar", {parent: this, style: ["VERTICAL"]});
      this._createItems();
      return this;
    },

    get: function(name) {
      if (name === "items") {
        this._checkDisposed();
        return this._items || [];
      }
      if (name === "template") {
        this._checkDisposed();
        return this._template || [];
      }
      return this.super("get", name);
    },

    set: function(arg1, arg2) {
      this.super("set", arg1, arg2);
      this._createItems();
    },

    _trigger: function(type) {
      if (type === "selection") {
        var event = arguments[1];
        var index = this._findItemIndex(event.item);
        var item = this._items ? this._items[index] : null;
        return this.trigger(type, {item: item, index: index});
      }
      tabris.Proxy.prototype._trigger.apply(this, arguments);
    },

    _findItemIndex: function(itemId) {
      for (var i = 0; i < this._children.length; i++) {
        if (this._children[i].id === itemId) {
          return i - 1;
        }
      }
      return -1;
    },

    _setProperty: function(name, value, properties) {
      switch (name) {
        case "template":
          this._checkDisposed();
          this._setTemplate(value, properties);
          break;
        case "items":
          this._checkDisposed();
          this._setItems(value, properties);
          break;
        default:
          this.super("_setProperty", name, value, properties);
      }
    },

    _setTemplate: function(template, properties) {
      this._template = template;
      if (this._template) {
        this._bindings = {text: [], image: []};
        var rowTemplate = [];
        for (var i = 0; i < this._template.length; i++) {
          var cell = this._template[i];
          var rowCell = util.omit(cell, ["binding", "foreground", "background"]);
          if ("binding" in cell && cell.type in this._bindings) {
            var bindings = this._bindings[cell.type];
            rowCell.bindingIndex = bindings.length;
            bindings.push(cell.binding);
          }
          if ("foreground" in cell) {
            rowCell.foreground = util.colorStringToArray(cell.foreground);
          }
          if ("background" in cell) {
            rowCell.background = util.colorStringToArray(cell.background);
          }
          rowTemplate.push(rowCell);
        }
        this._bindings.length = Math.max(this._bindings.text.length, this._bindings.image.length);
        properties.rowTemplate = rowTemplate;
      } else {
        delete this._bindings;
      }
    },

    _setItems: function(items, properties) {
      this._items = items;
      properties.itemCount = items ? items.length : 0;
      this._itemsPending = true;
    },

    _createItems: function() {
      if (!this._itemsPending) {
        return;
      }
      this._disposeItems();
      if (this._items) {
        var createTexts = this._createTextsFn();
        var createImages = this._createImagesFn();
        for (var i = 0; i < this._items.length; i++) {
          var item = this._items[i];
          tabris.create("ListItem", {
            parent: this,
            index: i,
            texts: createTexts(item),
            images: createImages(item)
          });
        }
      }
      delete this._itemsPending;
    },

    _disposeItems: function() {
      if (this._children) {
        // omit scroll bar
        for (var i = this._children.length - 1; i > 0; i--) {
          this._children[i].dispose();
        }
      }
    },

    _createTextsFn: function() {
      if (this._bindings) {
        return createValuesFn(this._bindings.text, this._bindings.length, "");
      }
      return function(item) {
        return [item.toString()];
      };
    },

    _createImagesFn: function() {
      if (this._bindings) {
        return createValuesFn(this._bindings.image, this._bindings.length, null);
      }
      return function() {
        return [null];
      };
    }

  });

  function createValuesFn(bindings, length, defaultValue) {
    return function(item) {
      var result = [];
      for (var i = 0; i < length; i++) {
        var name = bindings[i];
        result.push(name in item ? item[name] : defaultValue);
      }
      return result;
    };
  }

  tabris.registerType("ListItem", {
    _type: "rwt.widgets.GridItem"
  });

})();
