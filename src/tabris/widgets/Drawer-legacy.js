import {drop, extend} from "../util";

tabris.load(function() {

  if (device.platform !== "windows") {

    tabris.registerWidget("_Drawer", {
      _type: "tabris.Drawer",

      _events: {
        open: true,
        close: true
      }

    });

    tabris.registerWidget("Drawer", {

      _type: "rwt.widgets.Composite",

      _supportsChildren: true,

      _create: function(properties) {
        tabris.ui._setCurrentDrawer(this);
        this._drawer = tabris.create("_Drawer", {});
        this._drawer._on("open", function() {
          this.trigger("open", this);
        }, this);
        this._drawer._on("close", function() {
          this.trigger("close", this);
        }, this);
        this._super("_create", [extend(properties, {
          layoutData: {left: 0, right: 0, top: 0, bottom: 0}
        })].concat(drop(arguments)));
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
