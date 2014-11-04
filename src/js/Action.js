/**
 * Copyright (c) 2014 EclipseSource.
 * All rights reserved.
 */

tabris.registerType("Action", {

  _type: "tabris.Action",

  _checkProperty: {
    enabled: true,
    foreground: true,
    image: true,
    placementPriority: true,
    title: true,
    visibility: true
  },

  _listen: {selection: "Selection"},

  _trigger: {
    Selection: function(params) { this.trigger("selection", params); }
  },

  _create: function(properties) {
    this.super("_create", properties);
    this._setNativeProperty("parent", tabris._uiProxy._ui.id);
    return this;
  }

});
