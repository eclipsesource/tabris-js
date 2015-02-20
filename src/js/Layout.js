(function() {

  tabris.Layout = {

    checkLayoutData: function(layoutData) {
      if ("centerX" in layoutData) {
        if (("left" in layoutData) || ("right" in layoutData)) {
          console.warn("Inconsistent layoutData: centerX overrides left and right");
          return util.omit(layoutData, ["left", "right"]);
        }
      } else if (!("left" in layoutData) && !("right" in layoutData)) {
        console.warn("Incomplete layoutData: either left, right or centerX should be specified");
      }
      if ("baseline" in layoutData) {
        if (("top" in layoutData) || ("bottom" in layoutData) || ("centerY" in layoutData)) {
          console.warn("Inconsistent layoutData: baseline overrides top, bottom, and centerY");
          return util.omit(layoutData, ["top", "bottom", "centerY"]);
        }
      } else if ("centerY" in layoutData) {
        if (("top" in layoutData) || ("bottom" in layoutData)) {
          console.warn("Inconsistent layoutData: centerY overrides top and bottom");
          return util.omit(layoutData, ["top", "bottom"]);
        }
      } else if (!("top" in layoutData) && !("bottom" in layoutData)) {
        console.warn("Incomplete layoutData: either top, bottom, centerY, or baseline should be specified");
      }
      return layoutData;
    },

    encodeLayoutData: function(layoutData, targetWidget, force) {
      if (!targetWidget) {
        return layoutData;
      }
      var result = {};
      var parent = targetWidget.parent() || emptyParent;
      var proxyResolver = force ? toProxyIdForced : toProxyIdSave;
      for (var key in layoutData) {
        if (Array.isArray(layoutData[key])) {
          result[key] = layoutData[key].map(proxyResolver, parent);
        } else {
          result[key] = proxyResolver.call(parent, layoutData[key]);
        }
      }
      return result;
    }

  };

  function toProxyIdForced(ref) {
    if (typeof ref === "string") {
      return tabris.PropertyEncoding.proxy(this.children(ref)) || 0;
    }
    return tabris.PropertyEncoding.proxy(ref) || 0;
  }

  function toProxyIdSave(ref) {
    if (typeof ref === "string") {
      var proxy = this.children(ref)[0];
      if (!proxy) {
        throw new Error();
      }
      return tabris.PropertyEncoding.proxy(proxy);
    }
    return tabris.PropertyEncoding.proxy(ref) || 0;
  }

  var emptyParent = {
    children: function() {
      return null;
    }
  };

}());
