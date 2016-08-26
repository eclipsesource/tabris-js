tabris.load(function() {

  if (device.platform === "windows") {

    tabris.registerWidget("TabFolder", {

      _type: "tabris.TabFolder",

      _properties: {
        paging: {type: "boolean", default: false},
        selection: {type: "proxy", nocache: true},
        tabBarLocation: {
          type: ["choice", ["top", "bottom", "hidden", "auto"]],
          default: "auto"
        }
      },

      _supportsChildren: function(child) {
        return child.type === "Tab";
      },

      _events: {
        select: {
          alias: "change:selection",
          trigger: function(event) {
            var tab = tabris(event.selection);
            this.trigger("change:selection", this, tab, {});
            this.trigger("select", this, tab, {});
          }
        }
      }

    });

    tabris.registerWidget("Tab", {

      _type: "tabris.Tab",

      _properties: {
        title: {type: "string", default: ""},
        image: {type: "image", default: null},
        selectedImage: {type: "image", default: null},
        badge: {type: "string", default: ""}
      },

      _supportsChildren: true,

      _setParent: function(parent) {
        if (!(parent instanceof tabris.TabFolder)) {
          throw new Error("Tab must be a child of TabFolder");
        }
        tabris.Widget.prototype._setParent.call(this, parent);
      }

    });

  }

});
