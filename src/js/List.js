/**
 * Copyright (c) 2014 EclipseSource.
 * All rights reserved.
 */

(function() {

  tabris.registerWidget("_GridItem", {
    _type: "rwt.widgets.GridItem"
  });

  tabris.registerWidget("List", {

    _type: "rwt.widgets.Grid",

    _create: function(properties) {
      this.super("_create", util.extend({style: ["V_SCROLL"]}, properties));
      tabris.create("_ScrollBar", {style: ["VERTICAL"]}).appendTo(this);
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

    _trigger: {
      Selection: function(params) {
        var index = this._findItemIndex(params.item);
        var item = this._items ? this._items[index] : null;
        var cell = params.text ? params.text : "";
        this.trigger("selection", {item: item, index: index, cell: cell});
      }
    },

    _listen: {selection: "Selection"},

    _findItemIndex: function(itemId) {
      for (var i = 0; i < this._children.length; i++) {
        if (this._children[i].id === itemId) {
          return i - 1;
        }
      }
      return -1;
    },

    _setProperty: {
      template: function(value) {
        this._setTemplate(value);
      },
      items: function(value) {
        this._setItems(value);
      }
    },

    _setTemplate: function(template) {
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
        this._setProperty("rowTemplate", rowTemplate);
      } else {
        delete this._bindings;
      }
    },

    _setItems: function(items) {
      this._items = items;
      this._setProperty("itemCount", items ? items.length : 0);
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
          tabris.create("_GridItem", {
            index: i,
            texts: createTexts(item),
            images: createImages(item)
          }).appendTo(this);
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

})();
