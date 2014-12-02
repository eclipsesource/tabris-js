/**
 * Copyright (c) 2014 EclipseSource.
 * All rights reserved.
 */

(function() {

  var pageProperties = ["title", "image", "style", "topLevel"];

  tabris.registerWidget("_Page", {
    _type: "tabris.Page",
    _checkProperty: true
  });

  tabris.registerWidget("Page", {

    _type: "rwt.widgets.Composite",

    _supportsChildren: true,

    _checkProperty: {
      image: tabris.PropertyChecks.image,
      title: true,
      topLevel: tabris.PropertyChecks.boolean
    },

    _create: function(properties) {
      this.super("_create",  util.extend(util.omit(properties, pageProperties), {
        layoutData: {left: 0, right: 0, top: 0, bottom: 0}
      }));
      this._setPropertyNative("parent", tabris._shell.id);
      this._page = tabris.create("_Page", util.extend(util.pick(properties, pageProperties), {
        parent: tabris._uiProxy._ui,
        control: this
      }));
      this._page.widget = this;
      return this;
    },

    dispose: function() {
      this.super("dispose");
      this._page.dispose();
    },

    open: function() {
      tabris._uiProxy.setActivePage(this);
    },

    close: function() {
      this.dispose();
      tabris._uiProxy.restoreLastActivePage();
    }

  });

  pageProperties.forEach(function(property) {
    tabris.Page._setProperty[property] = function(value) {this._page.set(property, value);};
    tabris.Page._getProperty[property] = function() {return this._page.get(property);};
  });

}());
