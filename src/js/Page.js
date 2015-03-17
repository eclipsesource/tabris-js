(function() {

  var pageProperties = ["title", "image", "style", "topLevel"];

  tabris.registerWidget("_Page", {
    _type: "tabris.Page",

    _properties: {
      image: {
        type: "image",
        set: function(image) {
          this._image = image;
          this._nativeSet("image", image);
        },
        get: function() {
          return this._image;
        }
      },
      title: "string",
      topLevel: "boolean",
      control: "proxy",
      parent: "proxy",
      style: true
    }

  });

  tabris.registerWidget("Page", {

    _type: "rwt.widgets.Composite",

    _supportsChildren: true,

    _create: function(properties) {
      this.super("_create",  util.extend(util.omit(properties, pageProperties), {
        layoutData: {left: 0, right: 0, top: 0, bottom: 0}
      }));
      this._page = tabris.create("_Page", util.extend(util.pick(properties, pageProperties), {
        parent: tabris.ui,
        control: this
      }));
      this._page.widget = this;
      this._setParent(tabris.ui);
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
    tabris.Page._properties[property] = {
      set: function(value) {this._page.set(property, value);},
      get: function() {return this._page.get(property);}
    };
  });

}());
