/**
 * Copyright (c) 2014 EclipseSource.
 * All rights reserved.
 */

(function() {

  tabris.registerWidget("_ScrollBar", {
    _type: "rwt.widgets.ScrollBar",
    _listen: {Selection: true},
    _checkProperty: true
  });

  tabris.registerWidget("ScrollComposite", {

    _type: "rwt.widgets.ScrolledComposite",

    _listen: {
      scroll: function(listen) {
        if (listen) {
          this._scrollBar.on("Selection", this._scrollBarListener, this);
        } else {
          this._scrollBar.off("Selection", this._scrollBarListener, this);
        }
      }
    },

    _checkProperty: {style: true}, // TODO: should not be required

    _create: function(properties) {
      var scrollProps = util.omit(properties, ["scroll"]);
      this.super("_create", util.extend(scrollProps, {
        style: properties.scroll === "horizontal" ? ["H_SCROLL"] : ["V_SCROLL"]
      }));
      this._scrollBar = tabris.create("_ScrollBar", {
        style: properties.scroll === "horizontal" ? ["HORIZONTAL"] : ["VERTICAL"]
      });
      tabris._nativeBridge.set(this._scrollBar.id, "parent", this.id);
      this._composite = tabris.create("Composite");
      tabris._nativeBridge.set(this._composite.id, "parent", this.id);
      this._setNativeProperty("content", this._composite.id);
      return this;
    },

    _scrollBarListener: function() {
      var selection = this.get("origin");
      this.trigger("scroll", {x: selection[0], y: selection[1]});
    },

    _getContainer: function() {
      return this._composite;
    }

  });

})();
