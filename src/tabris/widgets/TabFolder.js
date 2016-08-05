tabris.registerWidget("TabFolder", {

  _type: "tabris.TabFolder",

  _properties: {
    paging: {type: "boolean", default: false},
    selection: {
      access: {
        set: function(name, tab, options) {
          if (this._children.indexOf(tab) < 0) {
            console.warn("Can not set TabFolder selection to " + tab);
            return;
          }
          this._nativeSet("selection", tab.cid);
          this.trigger("change:selection", this, tab, options);
        },
        get: function() {
          var selection = this._nativeGet("selection");
          return selection ? tabris._proxies.find(selection) : null;
        }
      }
    },
    tabBarLocation: {type: ["choice", ["top", "bottom", "hidden", "auto"]], default: "auto"}
  },

  _events: {
    select: {
      alias: "change:selection",
      trigger: function(event) {
        var tab = tabris._proxies.find(event.selection);
        this.trigger("change:selection", this, tab, {});
        this.trigger("select", this, tab, {});
      }
    }
  },

  _supportsChildren: function(child) {
    return child.type === "Tab";
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
