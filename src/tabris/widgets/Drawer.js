tabris.load(function() {

  if (device.platform === "windows") {

    tabris.registerWidget("Drawer", {

      _type: "tabris.Drawer",

      _supportsChildren: true,

      _create: function() {
        tabris.ui._setCurrentDrawer(this);
        this._super("_create", arguments);
        this._setParent(tabris.ui);
        return this;
      },

      _properties: {
        win_displayMode: {
          type: ["choice", ["overlay", "compactOverlay"]],
          default: "overlay"
        },
        win_buttonBackground: {
          type: "color",
          default: null
        },
        win_buttonTheme: {
          type: ["choice", ["light", "dark", "default"]],
          default: "default"
        }
      },

      _events: {
        open: {
          trigger: function() {
            this.trigger("open", this);
          }
        },
        close: {
          trigger: function() {
            this.trigger("close", this);
          }
        }
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
