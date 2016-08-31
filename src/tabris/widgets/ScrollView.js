tabris.registerWidget("_ScrollBar", {
  _type: "rwt.widgets.ScrollBar",
  _events: {Selection: true},
  _properties: {
    style: "any"
  }
});

tabris.registerWidget("ScrollView", {

  _type: "rwt.widgets.ScrolledComposite",

  _supportsChildren: true,

  _properties: {
    direction: {
      type: ["choice", ["horizontal", "vertical"]],
      default: "vertical"
    },
    scrollX: {
      type: "number",
      access: {
        set: function(name, value) {
          if (this.get("direction") === "horizontal") {
            this._nativeSet("origin", [value, 0]);
          }
        },
        get: function() {
          return this.get("direction") === "horizontal" ? this._nativeGet("origin")[0] : 0;
        }
      }
    },
    scrollY: {
      type: "number",
      access: {
        set: function(name, value) {
          if (this.get("direction") === "vertical") {
            this._nativeSet("origin", [0, value]);
          }
        },
        get: function() {
          return this.get("direction") === "vertical" ? this._nativeGet("origin")[1] : 0;
        }
      }
    }
  },

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
    this._super("_create", arguments);
    var style = properties.direction === "horizontal" ? ["H_SCROLL"] : ["V_SCROLL"];
    this._nativeSet("style", style);
    this._scrollBar = new tabris._ScrollBar({
      style: properties.direction === "horizontal" ? ["HORIZONTAL"] : ["VERTICAL"]
    });
    this._scrollBar._nativeSet("parent", this.cid);
    this._composite = new tabris.Composite();
    this._composite._nativeSet("parent", this.cid);
    this._nativeSet("content", this._composite.cid);
    return this;
  },

  _scrollBarListener: function() {
    var origin = this._nativeGet("origin");
    this.trigger("scroll", this, {x: origin[0], y: origin[1]});
  },

  _getContainer: function() {
    return this._composite;
  }

});
