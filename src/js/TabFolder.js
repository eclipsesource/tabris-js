(function() {

  tabris.registerWidget("_TabItem", {
    _type: "rwt.widgets.TabItem",
    _properties: {
      title: {
        set: function(value) {this._nativeSet("text", value);},
        nocache: true
      },
      image: {nocache: true},
      badge: {nocache: true},
      control: true,
      index: true
    }
  });

  tabris.registerWidget("TabFolder", {

    _type: "rwt.widgets.TabFolder",

    _create: function(properties) {
      this.super("_create", util.omit(properties, "tabBarLocation"));
      if (properties.tabBarLocation === "top") {
        this._nativeSet("style", ["TOP"]);
      } else if (properties.tabBarLocation === "bottom") {
        this._nativeSet("style", ["BOTTOM"]);
      }
      return this;
    },

    _properties: {
      paging: {
        type: "boolean",
        default: false,
        set: function(value) {
          this._nativeSet("data", {paging: value});
        }
      },
      selection: {
        set: function(tab) {
          if (!(tab instanceof tabris.Tab)) {
            console.warn("Can not set TabFolder selection to " + tab);
            return;
          }
          if (tab._isDisposed) {
            console.warn("Can not set TabFolder selection to disposed Tab");
            return;
          }
          this._nativeSet("selection", tab._tabItem.cid);
        },
        get: function() {
          var selection = this._nativeGet("selection");
          return selection ? tabris(selection)._tab : null;
        },
        nocache: true
      }
    },

    _supportsChildren: function(child) {
      return child.type === "Tab" || child.type === "_TabItem";
    },

    _events: {
      select: {
        name: "Selection",
        alias: "change:selection",
        trigger: function(event) {
          var tab = tabris(event.selection)._tab;
          this._triggerChangeEvent("selection", tab);
          this.trigger("select", this, tab, {});
        }
      }
    },

    _getItems: function() {
      return this._children ? this._children.filter(isItem) : new tabris.ProxyCollection();
    },

    _getSelectableChildren: function() {
      return this._children ? this._children.filter(isTab) : undefined;
    }

  });

  tabris.registerWidget("Tab", {

    _type: "rwt.widgets.Composite",

    _properties: {
      title: {
        type: "string",
        default: "",
        set: function(value) {
          if (this._tabItem) {
            this._tabItem._setProperty("title", value);
          }
        }
      },
      image: {
        type: "image",
        default: null,
        set: function(value) {
          if (this._tabItem) {
            this._tabItem._setProperty("image", value);
          }
        }
      },
      badge: {
        type: "string",
        default: "",
        set: function(value) {
          if (this._tabItem) {
            this._tabItem._setProperty("badge", value);
          }
        }
      }
    },

    _supportsChildren: true,

    _setParent: function(parent) {
      if (!(parent instanceof tabris.TabFolder)) {
        throw new Error("Tab must be a child of TabFolder");
      }
      tabris.Widgets._setParent.call(this, parent);
      this._tabItem = tabris.create("_TabItem", util.extend({
        control: this.cid,
        index: parent._getItems().length
      }, this._getItemProps())).appendTo(parent);
      this._tabItem._tab = this;
      this._on("dispose", this._tabItem.dispose, this._tabItem);
    },

    _getItemProps: function() {
      var result = {};
      for (var i = 0; i < itemProps.length; i++) {
        var prop = itemProps[i];
        if (this._getStoredProperty(prop) !== undefined) {
          result[prop] = this._getStoredProperty(prop);
        }
      }
      return result;
    }

  });

  function isTab(child) {
    return child instanceof tabris.Tab;
  }

  function isItem(child) {
    return !isTab(child);
  }

  var itemProps = ["title", "badge", "image"];

}());
