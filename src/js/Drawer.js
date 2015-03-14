(function() {

  tabris.registerWidget("_Drawer", {
    _type: "tabris.Drawer"
  });

  tabris.registerWidget("Drawer", {

    _type: "rwt.widgets.Composite",

    _supportsChildren: true,

    _create: function(properties) {
      tabris.ui._setCurrentDrawer(this);
      this._drawer = tabris.create("_Drawer", {});
      this.super("_create",  util.extend(properties, {
        layoutData: {left: 0, right: 0, top: 0, bottom: 0}
      }));
      this._setParent(tabris.ui);
      return this;
    },

    open: function() {
      this._drawer._nativeCall("open", {});
      return this;
    },

    close: function() {
      this._drawer._nativeCall("close", {});
      return this;
    },

    dispose: function() {
      tabris.ui._setCurrentDrawer(null);
      this._drawer.dispose();
      this.super("dispose");
    }

  });

}());
