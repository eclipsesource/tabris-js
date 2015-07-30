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
      title: {type: "string", default: ""},
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
      this.super("_create",  _.extend(_.omit(properties, pageProperties), {
        layoutData: {left: 0, right: 0, top: 0, bottom: 0}
      }));
      this._nativeSet("parent", tabris.ui._shell.cid);
      this._page = tabris.create("_Page", _.extend(_.pick(properties, pageProperties), {
        parent: tabris.ui,
        control: this
      }));
      this._page.widget = this;
      this._parent = tabris.ui;
      tabris.ui._addChild(this);
      this._on("dispose", function() {
        tabris.ui._pageClosed(this);
        this._page.dispose();
      });
      this._isTopLevel = !!properties.topLevel;
      return this;
    },

    open: function() {
      tabris.ui._pageOpened(this);
      return this;
    },

    close: function() {
      this.dispose();
    }

  });

  pageProperties.forEach(function(property) {
    tabris.Page._properties[property] = {
      type: true,
      set: function(value) {this._page.set(property, value);},
      get: function() {return this._page.get(property);}
    };
  });

}());
