tabris.registerType("_Display", {
  _type: "rwt.widgets.Display"
});

tabris.registerWidget("_Shell", {
  _type: "rwt.widgets.Shell",
  _events: {Close: true},
  _properties: {
    style: true,
    mode: true,
    active: true
  }
});

tabris.registerWidget("_UI", {

  _type: "tabris.UI",

  _events: {ShowPage: true, ShowPreviousPage: true},

  _supportsChildren: true,

  _create: function() {
    tabris.create("_Display");
    this._shell = tabris.create("_Shell", {
      style: ["NO_TRIM"],
      mode: "maximized",
      active: true,
      visible: true
    }).on("Close", function() {
      this.dispose();
    });
    tabris.Proxy.prototype._create.call(this, {});
    this._nativeSet("shell", this._shell.cid);
    this._pages = [];
    this._drawer = null;
    this._on("ShowPage", function(properties) {
      var page = tabris._proxies[properties.pageId];
      this._setActivePage(page.widget);
    })._on("ShowPreviousPage", function() {
      var page = this._getActivePage();
      if (page) {
        page.close();
      }
    });
    Object.defineProperty(this, "drawer", {
      get: function() { return this._drawer;}.bind(this),
      set: function() {}
    });
    return this;
  },

  _properties: {
    image: "image",
    foreground: "color",
    background: "color",
    activePage: {
      set: function(page) {
        this._setActivePage(page);
      },
      get: function() {
        return this._getActivePage();
      },
      nocache: true
    }
  },

  _setActivePage: function(page) {
    if (!(page instanceof tabris.Page)) {
      console.warn("Value for activePage is not a page");
      return;
    }
    var activePage = this._getActivePage();
    if (page !== activePage) {
      page.on("dispose", this._pageClosed.bind(this, page));
      this._pages.push(page);
      this._updateActivePage(activePage, page);
    }
  },

  _getContainer: function(child) {
    switch (child.type) {
      case "Drawer":
        return child._drawer;
      case "Action":
        return this;
      default:
        return this._shell;
    }
  },

  _setCurrentDrawer: function(drawer) {
    if (this._drawer && drawer) {
      throw new Error("Can not create multiple instances of Drawer");
    }
    this._drawer = drawer;
  },

  _getActivePage: function() {
    return this._pages[this._pages.length - 1];
  },

  _pageClosed: function(closedPage) {
    var oldActivePage = this._getActivePage();
    this._pages = this._pages.filter(function(page) {
      return page !== closedPage;
    });
    var newActivePage = this._getActivePage();
    if (newActivePage !== oldActivePage) {
      this._updateActivePage(oldActivePage, this._getActivePage());
    }
  },

  _updateActivePage: function(oldPage, newPage) {
    if (oldPage) {
      oldPage.trigger("disappear", oldPage);
    }
    this._nativeSet("activePage", newPage._page.cid);
    newPage.trigger("appear", newPage);
  }

});

tabris.load(function() {
  tabris.ui = tabris.create("_UI");
});
