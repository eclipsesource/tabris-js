tabris.registerType("_Display", {
  _type: "rwt.widgets.Display",
  _properties: true
});

tabris.registerWidget("_Shell", {
  _type: "rwt.widgets.Shell",
  _listen: {Close: true},
  _properties: true
});

tabris.registerType("_UI", {

  _type: "tabris.UI",

  _listen: {ShowPage: true, ShowPreviousPage: true},

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
    this._setPropertyNative("shell", this._shell.id);
    this._pages = [];
    this.on("ShowPage", function(properties) {
      var page = tabris._proxies[properties.pageId];
      this._setActivePage(page.widget);
    }).on("ShowPreviousPage", function() {
      var page = this._getActivePage();
      if (page) {
        page.close();
      }
    });
    return this;
  },

  _properties: {
    image: "image",
    foreground: "color",
    background: "color",
    activePage: true
  },

  _getProperty: {
    activePage: function() {
      return this._getActivePage();
    }
  },

  _setProperty: {
    activePage: function(page) {
      this._setActivePage(page);
    }
  },

  _setActivePage: function(page) {
    if (!(page instanceof tabris.Page)) {
      throw new Error("Value for activePage is not a page");
    }
    if (page !== this._getActivePage()) {
      page.on("dispose", this._pageClosed.bind(this, page));
      this._pages.push(page);
      this._setPropertyNative("activePage", page._page.id);
    }
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
    if (newActivePage && newActivePage !== oldActivePage) {
      this._setPropertyNative("activePage", newActivePage._page.id);
    }
  }

});

tabris.load(function() {
  tabris.ui = tabris.create("_UI");
});
