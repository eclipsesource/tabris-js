tabris.load(function() {

  if (device.platform === "UWP") {

    tabris.registerWidget("Drawer", {

      _type: "tabris.Drawer",

      _supportsChildren: true,

      _create: function() {
        tabris.ui._setCurrentDrawer(this);
        this._super("_create", arguments);
        this._setParent(tabris.ui);
        return this;
      },

      open: function() {
        this._nativeCall("open", {});
        return this;
      },

      close: function() {
        this._nativeCall("close", {});
        return this;
      },

      dispose: function() {
        tabris.ui._setCurrentDrawer(null);
        this._super("dispose", arguments);
      }

    });

  }

});
