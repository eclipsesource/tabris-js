/**
 * Copyright (c) 2014 EclipseSource.
 * All rights reserved.
 */

tabris.registerType("Action", {

  _type: "tabris.Action",

  _listen: {
    selection: function(listen) { tabris._nativeBridge.listen(this.id, "Selection", listen); }
  },
  _trigger: {
    Selection: function(params) { this.trigger("selection", params); }
  },

  _create: function(properties) {
    return this.super("_create", util.extend({
      parent: tabris._uiProxy._ui
    }, properties));
  }

});
