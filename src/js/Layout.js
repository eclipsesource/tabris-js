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
      for (var key in layoutData) {
        result[key] = encodePart(layoutData[key], key, parent, force);
      }
      return result;
    }

  };

  function encodePart(part, name, parent, force) {
    if (typeof part === "number") {
      return part;
    }
    if (Array.isArray(part)) {
      return encodeArrayPart(part, name, parent, force);
    }
    if (isPercentage(part)) {
      return [parseInt(part), 0];
    }
    if (!directWidgetRef[name]) {
      return [toProxyId(part, parent, force), 0];
    }
    return toProxyId(part, parent, force);
  }

  function encodeArrayPart(part, name, parent, force) {
    if (isPercentage(part[0])) {
      return [parseInt(part[0]), part[1]];
    }
    return [toProxyId(part[0], parent, force), part[1]];
  }

  function toProxyId(ref, parent, force) {
    if (typeof ref === "string") {
      var proxy = parent.children(ref)[0];
      if (!proxy && !force) {
        throw new Error();
      }
      return tabris.PropertyEncoding.proxy(proxy) || 0;
    }
    return tabris.PropertyEncoding.proxy(ref) || 0;
  }

  function isPercentage(value) {
    return typeof value === "string" && value[value.length - 1] === "%" && !isNaN(parseInt(value));
  }

  var emptyParent = {
    children: function() {
      return [];
    }
  };

  var directWidgetRef = {
    centerX: true,
    centerY: true,
    baseline: true
  };

}());
