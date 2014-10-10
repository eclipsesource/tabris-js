/**
 * Copyright (c) 2014 EclipseSource.
 * All rights reserved.
 */

tabris.registerType("Action", {

  _type: "tabris.Action",

  _create: function(properties) {
    return this.super("_create", util.extend({
      parent: tabris._uiProxy._ui
    }, properties));
  }

});
