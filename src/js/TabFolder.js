(function() {

  tabris.registerType("_TabItem", {
    _type: "rwt.widgets.TabItem",
    _properties: {
      text: true,
      image: true,
      badge: true,
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
      paging: tabris.PropertyEncoding.boolean,
      selection: true
    },

    _supportsChildren: function(child) {
      return child.type === "Tab" || child.type === "_TabItem";
    },

    _listen: {"change:selection": "Selection"},
    _trigger: {Selection: "change:selection"},

    _setProperty: {
      paging: function(value) {
        this._paging = value;
        this._nativeSet("data", {paging: value});
      },
      selection: function(tab) {
        this._nativeSet("selection", tab._tabItem.cid);
      }
    },

    _getProperty: {
      paging: function() {return !!this._paging;},
      selection: function() {
        var selection = this._nativeGet("selection");
        return selection ? tabris(selection)._tab : null;
      }
    },

    _getItems: function() {
      return this._children ? this._children.filter(isItem) : [];
    },

    children: function() {
      return this._children ? this._children.filter(isTab) : [];
    }

  });

  tabris.registerWidget("Tab", {

    _type: "rwt.widgets.Composite",

    _properties: {
      title: "string",
      image: "image",
      badge: "string"
    },

    _listen: {addchild: function() {}, removechild: function() {}},

    _supportsChildren: true,

    _create: function(properties) {
      this._itemProps = {};
      return this.super("_create", properties);
    },

    _setProperty: {
      title: function(value) {this._setItemProperty("text", value);},
      image: function(value) {this._setItemProperty("image", value);},
      badge: function(value) {this._setItemProperty("badge", value);}
    },

    _setItemProperty: function(name, value) {
      if (this._tabItem) {
        this._tabItem._setProperty(name, value);
      } else {
        this._itemProps[name] = value;
      }
    },

    get: function(name) {
      if (isItemProp(name)) {
        if (this._tabItem) {
          return this._tabItem.get(translateItemProp(name));
        }
        var result = this._itemProps[translateItemProp(name)];
        if (name === "image") {
          return tabris.PropertyDecoding.image(result);
        }
        return result;
      }
      return this.super("get", name);
    },

    _setParent: function(parent) {
      if (!(parent instanceof tabris.TabFolder)) {
        throw new Error("Tab must be a child of TabFolder");
      }
      this.super("_setParent", parent);
      this._tabItem = tabris.create("_TabItem", util.extend({
        control: this.cid,
        index: parent._getItems().length
      }, this._itemProps)).appendTo(parent);
      this._tabItem._tab = this;
    },

    _destroy: function() {
      if (this._tabItem) {
        this._tabItem.dispose();
      }
    }

  });

  function isItemProp(name) {
    return ["title", "image", "badge"].indexOf(name) !== -1;
  }

  function translateItemProp(name) {
    return name === "title" ? "text" : name;
  }

  function isTab(child) {
    return child instanceof tabris.Tab;
  }

  function isItem(child) {
    return !isTab(child);
  }

}());
