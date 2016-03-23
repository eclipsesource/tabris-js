tabris.load(function() {

  if (device.platform !== "windows") {

    tabris.registerWidget("_Drawer", {
      _type: "tabris.Drawer"
    });

    tabris.registerWidget("Drawer", {

      _type: "rwt.widgets.Composite",

      _supportsChildren: true,

      _create: function(properties) {
        tabris.ui._setCurrentDrawer(this);
        this._drawer = tabris.create("_Drawer", {});
        this._super("_create", [_.extend(properties, {
          layoutData: {left: 0, right: 0, top: 0, bottom: 0}
        })].concat(_.drop(arguments)));
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
        this._super("dispose", arguments);
      }

    });
  }

});
