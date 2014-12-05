/**
 * Copyright (c) 2014 EclipseSource.
 * All rights reserved.
 */

tabris.registerType("Action", {

  _type: "tabris.Action",

  _checkProperty: {
    enabled: tabris.PropertyChecks.boolean,
    foreground: true,
    image: tabris.PropertyChecks.image,
    placementPriority: tabris.PropertyChecks.choice("LOW", "HIGH", "NORMAL"),
    title: tabris.PropertyChecks.string,
    visible: tabris.PropertyChecks.boolean
  },

  _setProperty: {
    foreground: function(value) {
      this._setPropertyNative("foreground", tabris.PropertyEncoding.encodeColor(value));
    },
    visible: function(value) {
      this._setPropertyNative("visibility", value);
    },
    image: function(value) {
      this._setPropertyNative("image", tabris.PropertyEncoding.encodeImage(value));
    }
  },

  _getProperty: {
    foreground: function() {
      return tabris.PropertyEncoding.decodeColor(this._getPropertyNative("foreground"));
    },
    visible: function() {
      return this._getPropertyNative("visibility");
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
