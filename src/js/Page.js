(function(require) {

  var util = require("tabris-util");

  var pageProperties = ["title", "image", "style", "topLevel"];

  tabris.registerType("_Page", {
    _type: "tabris.Page",

    _properties: {
      image: "image",
      title: "string",
      topLevel: "boolean",
      control: true,
      parent: true,
      style: true
    }

  });

  tabris.registerWidget("Page", {

    _type: "rwt.widgets.Composite",

    _listen: {
      addchild: function() {},
      removechild: function() {},
      appear: function() {},
      disappear: function() {}
    },

    _supportsChildren: true,

    _properties: {
      image: true,
      title: true,
      topLevel: true
    },

    _create: function(properties) {
      this.super("_create",  util.extend(util.omit(properties, pageProperties), {
        layoutData: {left: 0, right: 0, top: 0, bottom: 0}
      }));
      this._nativeSet("parent", tabris.ui._shell.cid);
      this._page = tabris.create("_Page", util.extend(util.pick(properties, pageProperties), {
        parent: tabris.ui,
        control: this
      }));
      this._page.widget = this;
      return this;
    },

    dispose: function() {
      this._page.dispose();
      this.super("dispose");
    },

    open: function() {
      tabris.ui.set("activePage", this);
      return this;
    },

    close: function() {
      this.dispose();
    }

  });

  pageProperties.forEach(function(property) {
    tabris.Page._setProperty[property] = function(value) {this._page.set(property, value);};
    tabris.Page._getProperty[property] = function() {return this._page.get(property);};
  });

}(tabris.Module.require));
