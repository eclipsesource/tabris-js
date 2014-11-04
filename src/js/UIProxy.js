/**
 * Copyright (c) 2014 EclipseSource.
 * All rights reserved.
 */

tabris.registerType("_Display", {
  _type: "rwt.widgets.Display",
  _checkProperty: true
});
tabris.registerType("_Shell", {
  _type: "rwt.widgets.Shell",
  _listen: {Close: true},
  _checkProperty: true
});
tabris.registerType("_UI", {
  _type: "tabris.UI",
  _listen: {ShowPage: true, ShowPreviousPage: true},
  _checkProperty: true
});

tabris.UIProxy = function() {
  this._pages = [];
};

tabris.UIProxy.prototype = {

  _create: function() {
    var self = this;
    tabris.create("_Display");
    tabris._shell = tabris.create("_Shell", {
      style: ["NO_TRIM"],
      mode: "maximized",
      active: true,
      visibility: true
    });
    tabris._shell.on("Close", function() {
      tabris._shell.dispose();
    });
    this._ui = tabris.create("_UI", {
      shell: tabris._shell
    });
    this._ui.on("ShowPage", function(properties) {
      var page = tabris._proxies[properties.pageId];
      self.setActivePage(page);
    });
    this._ui.on("ShowPreviousPage", function() {
      self.getActivePage().close();
    });
    return this;
  },

  _install: function(target) {
    target._uiProxy = this;
  },

  setActivePage: function(page) {
    this._pages.push(page);
    this._ui.set("activePage", page._page);
  },

  getActivePage: function() {
    return this._pages[ this._pages.length - 1 ];
  },

  setLastActivePage: function() {
    this._pages.pop();
    var page = this.getActivePage();
    if (page) {
      this._ui.set("activePage", page._page);
    }
  }

};

tabris.load(function() {
  new tabris.UIProxy()._create()._install(tabris);
});
