/**
 * Copyright (c) 2014 EclipseSource.
 * All rights reserved.
 */

(function() {

  tabris.registerType("TabFolder", {

    _type: "rwt.widgets.TabFolder",

    _getItems: function() {
      return this._children.filter(isItem);
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
      this.super("_create", getControlProps(properties));
      this._tabItem = new TabItem();
      this._tabItem.set(util.extend(getItemProps(properties), {control: this.id}));
      this.on("dispose", this._tabItem.dispose, this._tabItem);
      return this;
    },

    set: function() {
      var properties = asProperties(arguments);
      this.super("set", getControlProps(properties));
      this._tabItem.set(getItemProps(properties));
      return this;
    },

    get: function(property) {
      if (itemOnlyProps.indexOf(property) !== -1) {
        return this._tabItem.get(itemPropRenames[property] || property);
      }
      return this.super("get", property);
    }

  });

  var TabItem = function() {
    tabris.Proxy.apply(this, arguments);
  };

  TabItem.prototype = util.extendPrototype(tabris.Proxy, {

    type: "rwt.widgets.TabItem",

    set: function() {
      this._checkDisposed();
      var properties = asProperties(arguments);
      if (!this._parent && !properties.parent) {
        this._propertyCache = util.extend(this._propertyCache || {}, properties);
      } else if (!this._parent && properties.parent) {
        if (!(properties.parent instanceof tabris.TabFolder)) {
          throw new Error("Tab must be a child of TabFolder");
        }
        properties = util.extend(this._propertyCache || {}, properties);
        delete this._propertyCache;
        properties.index = properties.parent._getItems().length;
        this._create(properties);
      } else {
        this.super("set", properties);
      }
      return this;
    },

    get: function(property) {
      if (!this._parent) {
        return this._propertyCache[property];
      }
      return this.super("get", property);
    }

  });

  var itemProps = ["title", "image", "badge", "parent"];
  var itemOnlyProps = ["title", "image", "badge"];
  var itemPropRenames = {title: "text"};

  function getControlProps(properties) {
    return util.omit(properties || {}, itemOnlyProps);
  }

  function getItemProps(properties) {
    // TODO [tb]: Should "image" become "icon" as well?
    return util.rename(util.pick(properties || {}, itemProps), itemPropRenames);
  }

  function isTab(child) {
    return child instanceof tabris.Tab;
  }

  function isItem(child) {
    return child instanceof TabItem;
  }

  function asProperties(args) {
    var properties;
    if (typeof args[0] === "string") {
      properties = {};
      properties[args[0]] = args[1];
    } else {
      properties = args[0];
    }
    return properties;
  }

}());
