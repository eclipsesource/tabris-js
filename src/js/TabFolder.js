/**
 * Copyright (c) 2014 EclipseSource.
 * All rights reserved.
 */

(function() {

  tabris.registerType("_TabItem", {
    _type: "rwt.widgets.TabItem"
  });

  tabris.registerType("TabFolder", {

    _type: "rwt.widgets.TabFolder",

    _getItems: function() {
      return this._children ? this._children.filter(isItem) : [];
    },

    _setProperty: function(prop, value) {
      if (prop === "paging") {
        this._paging = value;
        this.super("_setProperty", "data", {paging: value});
      } else {
        this.super("_setProperty", prop, value);
      }
    },

    get: function(prop) {
      if (prop === "paging") {
        return !!this._paging;
      }
      return this.super("get", prop);
    },

    children: function() {
      return this._children ? this._children.filter(isTab) : [];
    }

  });

  tabris.registerType("Tab", {

    _type: "rwt.widgets.Composite",

    _create: function(properties) {
      this._itemProps = {};
      return this.super("_create", properties);
    },

    _setProperty: function(name, value) {
      if (isItemProp(name)) {
        if (this._tabItem) {
          this._tabItem._setProperty(translateItemProp(name), value);
        } else {
          this._itemProps[translateItemProp(name)] = value;
        }
      } else {
        this.super("_setProperty", name, value);
      }
    },

    get: function(name) {
      if (isItemProp(name)) {
        if (this._tabItem) {
          return this._tabItem.get(translateItemProp(name));
        }
        return this._itemProps[translateItemProp(name)];
      }
      return this.super("get", name);
    },

    _setParent: function(parent) {
      if (!(parent instanceof tabris.TabFolder)) {
        throw new Error("Tab must be a child of TabFolder");
      }
      this.super("_setParent", parent);
      this._tabItem = tabris.create("_TabItem", util.extend({
        control: this.id,
        index: parent._getItems().length
      }, this._itemProps)).appendTo(parent);
    },

    _destroy: function() {
      if (this._tabItem) {
        this._tabItem.dispose();
      }
    }
  });

  function isItemProp(name) {
    return ["title", "image", "badge"].indexOf(name) !== -1;
  }

  function translateItemProp(name) {
    return name === "title" ? "text" : name;
  }

  function isTab(child) {
    return child instanceof tabris.Tab;
  }

  function isItem(child) {
    return !isTab(child);
  }

}());
