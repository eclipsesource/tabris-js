/**
 * Copyright (c) 2014 EclipseSource.
 * All rights reserved.
 */

tabris.registerType("Page", {

  _type: "tabris.Page",

  _PAGE_PROPS: ["title", "image", "style", "topLevel"],

  _create: function(properties) {
    var compositeProperties = util.extend(util.omit(properties, this._PAGE_PROPS), {
      parent: tabris._shell,
      layoutData: {left: 0, right: 0, top: 0, bottom: 0}
    });
    this._composite = tabris.create("rwt.widgets.Composite", compositeProperties);
    var pageProperties = util.extend(util.pick(properties, this._PAGE_PROPS), {
      parent: tabris._uiProxy._ui,
      control: this._composite
    });
    this.super("_create", pageProperties);
    return this;
  },

  get: function(property) {
    if (this._PAGE_PROPS.indexOf(property) !== -1) {
      return this.super("get", property);
    }
    return this._composite.get(property);
  },

  set: function(arg1, arg2) {
    var properties;
    if (typeof arg1 === "string") {
      properties = {};
      properties[arg1] = arg2;
    } else {
      properties = arg1;
    }
    this.super("set", util.pick(properties, this._PAGE_PROPS));
    this._composite.set(util.omit(properties, this._PAGE_PROPS));
    return this;
  },

  call: function(method, parameters) {
    this._composite.call(method, parameters);
    return this;
  },

  on: function(event, listener) {
    this._composite.on(event, listener);
    return this;
  },

  off: function(event, listener) {
    this._composite.off(event, listener);
    return this;
  },

  dispose: function() {
    this._composite.dispose();
    this.super("dispose");
  },

  open: function() {
    tabris._uiProxy.setActivePage(this);
  },

  close: function() {
    this._composite.dispose();
    tabris._uiProxy.setLastActivePage();
    this.dispose();
  },

  _getContainer: function() {
    return this._composite;
  }

});
