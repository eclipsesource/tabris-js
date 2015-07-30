tabris.registerWidget("_ScrollBar", {
  _type: "rwt.widgets.ScrollBar",
  _events: {Selection: true},
  _properties: {
    style: true
  }
});

tabris.registerWidget("ScrollView", {

  _type: "rwt.widgets.ScrolledComposite",

  _supportsChildren: true,

  _events: {
    scroll: {
      listen: function(listen) {
        if (listen) {
          this._scrollBar.on("Selection", this._scrollBarListener, this);
        } else {
          this._scrollBar.off("Selection", this._scrollBarListener, this);
        }
      },
      trigger: function(position) {
        this.trigger(this, position, {});
      }
    }
  },

  _create: function(properties) {
    var scrollProps = util.omit(properties, ["direction"]);
    this.super("_create", scrollProps);
    var style = properties.direction === "horizontal" ? ["H_SCROLL"] : ["V_SCROLL"];
    this._nativeSet("style", style);
    this._scrollBar = tabris.create("_ScrollBar", {
      style: properties.direction === "horizontal" ? ["HORIZONTAL"] : ["VERTICAL"]
    });
    this._scrollBar._nativeSet("parent", this.cid);
    this._composite = tabris.create("Composite");
    this._composite._nativeSet("parent", this.cid);
    this._nativeSet("content", this._composite.cid);
    return this;
  },

  _scrollBarListener: function() {
    var selection = this._nativeGet("origin");
    this.trigger("scroll", this, {x: selection[0], y: selection[1]});
  },

  _getContainer: function() {
    return this._composite;
  }

});

tabris.registerWidget("ScrollComposite", tabris.ScrollView);
