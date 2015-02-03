tabris.registerWidget("_ScrollBar", {
  _type: "rwt.widgets.ScrollBar",
  _listen: {Selection: true},
  _properties: true
});

tabris.registerWidget("ScrollComposite", {

  _type: "rwt.widgets.ScrolledComposite",

  _supportsChildren: true,

  _listen: {
    scroll: function(listen) {
      if (listen) {
        this._scrollBar.on("Selection", this._scrollBarListener, this);
      } else {
        this._scrollBar.off("Selection", this._scrollBarListener, this);
      }
    },
    addchild: function() {},
    removechild: function() {}
  },

  _create: function(properties) {
    var scrollProps = util.omit(properties, ["direction"]);
    this.super("_create", scrollProps);
    var style = properties.direction === "horizontal" ? ["H_SCROLL"] : ["V_SCROLL"];
    this._nativeSet("style", style);
    this._scrollBar = tabris.create("_ScrollBar", {
      style: properties.direction === "horizontal" ? ["HORIZONTAL"] : ["VERTICAL"]
    });
    tabris._nativeBridge.set(this._scrollBar.cid, "parent", this.cid);
    this._composite = tabris.create("Composite");
    tabris._nativeBridge.set(this._composite.cid, "parent", this.cid);
    this._nativeSet("content", this._composite.cid);
    return this;
  },

  _scrollBarListener: function() {
    var selection = this._nativeGet("origin");
    this.trigger("scroll", {x: selection[0], y: selection[1]});
  },

  _getContainer: function() {
    return this._composite;
  }

});
