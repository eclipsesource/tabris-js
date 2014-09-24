/**
 * Copyright (c) 2014 EclipseSource.
 * All rights reserved.
 */

(function() {

tabris.ScrollCompositeProxy = function() {
  this.Super();
};

tabris.ScrollCompositeProxy.create = function(properties) {
  return new tabris.ScrollCompositeProxy()._create(properties);
};

tabris.ScrollCompositeProxy.prototype = util.extendPrototype(tabris.Proxy, {

  _create: function(properties) {
    var scrollProps = util.omit(properties, ["scroll"]);
    this.super("_create", "rwt.widgets.ScrolledComposite", util.extend(scrollProps, {
      style: properties.scroll === "horizontal" ? ["H_SCROLL"] : ["V_SCROLL"]
    }));
    this._scrollBar = this.super( "append", "rwt.widgets.ScrollBar", {
      style: properties.scroll === "horizontal" ? ["HORIZONTAL"] : ["VERTICAL"]
    });
    this._composite = this.super("append", "rwt.widgets.Composite", {});
    this.set("content", this._composite);
    return this;
  },

  append: function(type, properties) {
    return this._composite.append(type, properties);
  },

  on: function(event, listener, context) {
    if (event === "Scroll" && !this._isListening("Scroll")) {
      this._scrollBar.on("Selection", this._scrollBarListener, this);
    }
    return this.super("on", event, listener, context);
  },

  off: function(event, listener, context) {
    var result = this.super("off", event, listener, context);
    if (event === "Scroll" && !this._isListening("Scroll")) {
      this._scrollBar.off("Selection", this._scrollBarListener, this);
    }
    return result;
  },

  _scrollBarListener: function() {
    var selection = this.get("origin");
    this.trigger("Scroll", { x: selection[0], y: selection[1] });
  }

});

tabris.Proxy._factories.ScrollComposite = function(type, properties) {
  return new tabris.ScrollCompositeProxy()._create(properties);
};

})();
