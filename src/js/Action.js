/**
 * Copyright (c) 2014 EclipseSource.
 * All rights reserved.
 */

tabris.registerType("Action", {

  _type: "tabris.Action",

  _checkProperty: {
    enabled: true,
    foreground: true,
    image: tabris.PropertyChecks.image,
    placementPriority: true,
    title: true,
    visibility: true
  },

  _setProperty: {
    foreground: function(value) {
      this._setPropertyNative("foreground", tabris.PropertyEncoding.encodeColor(value));
    }
  },

  _getProperty: {
    foreground: function() {
      return tabris.PropertyEncoding.decodeColor(this._getPropertyNative("foreground"));
    }
  },

  _listen: {selection: "Selection"},

  _trigger: {
    Selection: function(params) { this.trigger("selection", params); }
  },

  _create: function(properties) {
    this.super("_create", properties);
    this._setPropertyNative("parent", tabris._uiProxy._ui.id);
    return this;
  }

});
