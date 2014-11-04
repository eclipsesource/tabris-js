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
    return this.super("_create", util.extend({
      parent: tabris._uiProxy._ui
    }, properties));
  }

});
