tabris.registerType("_Display", {
  _type: "rwt.widgets.Display"
});

tabris.registerWidget("_Shell", {
  _type: "rwt.widgets.Shell",
  _events: {Close: true},
  _properties: {
    style: "any",
    mode: "any",
    active: "any"
  }
});

tabris.registerWidget("_UI", {

  _type: "tabris.UI",

  _events: {ShowPreviousPage: true},

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
    this._super("_create", arguments);
    this._nativeSet("shell", this._shell.cid);
    this._pages = [];
    this._drawer = null;
    this._on("ShowPreviousPage", function() {
      var page = this.get("activePage");
      if (page) {
        page.close();
      }
    });
    this._on("change:activePage", this._onChangeActivePage, this);
    this._removedPages = [];
    Object.defineProperty(this, "drawer", {
      get: function() { return this._drawer; }.bind(this),
      set: function() {}
    });
    return this;
  },

  _properties: {
    image: "image",
    toolbarVisible: {type: "boolean", default: true},
    displayMode: {
      type: ["choice", ["normal", "fullscreen"]],
      default: "normal"
    },
    statusBarTheme: {
      type: ["choice", ["light", "dark", "default"]],
      default: "default"
    },
    activePage: {
      access: {
        set: function(name, page, options) {
          if (!(page instanceof tabris.Page)) {
            throw new Error("Value for activePage is not a page");
          }
          this._nativeSet("activePage", page._page.cid);
          this._storeProperty(name, page, options);
        }
      }
    }
  },

  _getContainer: function(child) {
    switch (child.type) {
      case "Drawer":
        return child._drawer ? child._drawer : this; // child._drawer used for the legacy drawer
      case "Action":
      case "SearchAction":
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

  _pageOpened: function(page) {
    this.set("activePage", page);
  },

  _pageClosed: function(page) {
    if (!this._isOnStack(page)) {
      return;
    }
    if (!page._isTopLevel || page === this._getCurrentTopLevelPage()) {
      this._removePagesOnTop(page);
      this._pages.pop();
    } else if (page._isTopLevel) {
      this._removeFromStack(page);
    }
    var newActivePage = this._getCurrentPage();
    if (!newActivePage) {
      throw new Error("Cannot close the last page");
    }
    this.set("activePage", newActivePage);
  },

  _onChangeActivePage: function(ui, page) {
    if (page !== this._getCurrentPage()) {
      if (!this._getCurrentPage() && !page._isTopLevel) {
        throw new Error("Opened page without a top-level page");
      }
      var onStack = this._isOnStack(page);
      if (onStack || page._isTopLevel) {
        this._removePagesOnTop(page);
        if (onStack && page._isTopLevel) {
          this._removeFromStack(page);
        }
      }
      if (page !== this._getCurrentPage()) {
        this._pages.push(page);
      }
    }
    this._updateActivePage(page);
  },

  _removePagesOnTop: function(page) {
    var topPage = this._getCurrentPage();
    while (topPage) {
      if (topPage === page || topPage._isTopLevel) {
        break;
      }
      this._removedPages.push(this._pages.pop());
      topPage = this._getCurrentPage();
    }
  },

  _getCurrentTopLevelPage: function() {
    var index = this._pages.length - 1;
    while (index > 0) {
      var page = this._pages[index--];
      if (page._isTopLevel) {
        return page;
      }
    }
  },

  _getCurrentPage: function() {
    return this._pages[this._pages.length - 1];
  },

  _removeFromStack: function(page) {
    var index = this._pages.indexOf(page);
    if (index !== -1) {
      this._pages.splice(index, 1);
    }
  },

  _isOnStack: function(page) {
    return this._pages.indexOf(page) !== -1;
  },

  _updateActivePage: function(newPage) {
    var oldPage = this._oldActivePage;
    if (newPage !== oldPage) {
      if (oldPage) {
        oldPage.trigger("disappear", oldPage);
      }
      if (newPage) {
        newPage.trigger("appear", newPage);
      } // TODO else (when last page closed), send SET activePage null ? )
    }
    this._closeRemovedPages();
    this._oldActivePage = newPage;
  },

  _closeRemovedPages: function() {
    this._removedPages.forEach(function(page) {
      page.close();
    });
    this._removedPages = [];
  }

});

tabris.load(function() {
  tabris.ui = tabris.create("_UI");
});
