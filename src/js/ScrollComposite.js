/**
 * Copyright (c) 2014 EclipseSource.
 * All rights reserved.
 */

(function() {

  tabris.registerType("ScrollComposite", {

    _type: "rwt.widgets.ScrolledComposite",

    _create: function(properties) {
      var scrollProps = util.omit(properties, ["scroll"]);
      this.super("_create", util.extend(scrollProps, {
        style: properties.scroll === "horizontal" ? ["H_SCROLL"] : ["V_SCROLL"]
      }));
      this._scrollBar = new tabris.Proxy();
      tabris._nativeBridge.create(this._scrollBar.id, "rwt.widgets.ScrollBar");
      tabris._nativeBridge.set(this._scrollBar.id, "parent", this.id);
      var style = properties.scroll === "horizontal" ? ["HORIZONTAL"] : ["VERTICAL"];
      tabris._nativeBridge.set(this._scrollBar.id, "style", style);
      this._composite = new tabris.Proxy();
      tabris._nativeBridge.create(this._composite.id, "rwt.widgets.Composite");
      tabris._nativeBridge.set(this._composite.id, "parent", this.id);
      this.set("content", this._composite);
      return this;
    },

    on: function(event, listener, context) {
      if (event === "scroll" && !this._isListening("scroll")) {
        this._scrollBar.on("selection", this._scrollBarListener, this);
      }
      return this.super("on", event, listener, context);
    },

    off: function(event, listener, context) {
      var result = this.super("off", event, listener, context);
      if (event === "scroll" && !this._isListening("scroll")) {
        this._scrollBar.off("selection", this._scrollBarListener, this);
      }
      return result;
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
