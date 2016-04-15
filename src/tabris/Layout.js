(function() {

  tabris.Layout = {

    checkConsistency: function(layoutData) {
      var result = layoutData;
      if ("centerX" in result) {
        if (("left" in result) || ("right" in result)) {
          console.warn("Inconsistent layoutData: centerX overrides left and right");
          result = _.omit(result, ["left", "right"]);
        }
      }
      if ("baseline" in result) {
        if (("top" in result) || ("bottom" in result) || ("centerY" in result)) {
          console.warn("Inconsistent layoutData: baseline overrides top, bottom, and centerY");
          result = _.omit(result, ["top", "bottom", "centerY"]);
        }
      } else if ("centerY" in result) {
        if (("top" in result) || ("bottom" in result)) {
          console.warn("Inconsistent layoutData: centerY overrides top and bottom");
          result = _.omit(result, ["top", "bottom"]);
        }
      }
      if ("left" in result && "right" in result && "width" in result) {
        console.warn("Inconsistent layoutData: left and right are set, ignore width");
        result = _.omit(result, ["width"]);
      }
      if ("top" in result && "bottom" in result && "height" in result) {
        console.warn("Inconsistent layoutData: top and bottom are set, ignore height");
        result = _.omit(result, ["height"]);
      }
      return result;
    },

    encodeLayoutData: function(layoutData) {
      var result = {};
      for (var key in layoutData) {
        if (layoutData[key] != null) {
          if (!(key in encoders)) {
            throw new Error("Invalid key '" + key + "' in layoutData");
          }
          try {
            result[key] = encoders[key](layoutData[key]);
          } catch (error) {
            throw new Error("Invalid value for '" + key + "': " + error.message);
          }
        }
      }
      return result;
    },

    encodeEdge: function(value) {
      if (isStringList(value)) {
        return encodeStringList(value);
      }
      if (Array.isArray(value)) {
        return encodeArray(value);
      }
      if (isNumber(value)) {
        return value;
      }
      if (isPercentage(value)) {
        var percentage = parseInt(value);
        return percentage === 0 ? 0 : [percentage, 0];
      }
      if (isWidgetRef(value)) {
        return [value, 0];
      }
      throw new Error("invalid type");
    },

    encodeSize: function(value) {
      if (!isNumber(value)) {
        throw new Error("must be a number");
      }
      return value;
    },

    encodeRef: function(value) {
      if (!isWidgetRef(value)) {
        throw new Error("must be a widget reference");
      }
      return value;
    },

    decodeLayoutData: function(layoutData) {
      if (!layoutData) {
        return null;
      }
      var result = {};
      for (var key in layoutData) {
        result[key] = tabris.Layout.decodeAttribute(layoutData[key]);
      }
      return result;
    },

    decodeAttribute: function(value) {
      return Array.isArray(value) ? decodeArray(value) : value;
    },

    resolveReferences: function(layoutData, targetWidget) {
      if (!targetWidget) {
        return layoutData;
      }
      var result = {};
      for (var key in layoutData) {
        result[key] = resolveAttribute(layoutData[key], targetWidget);
      }
      return result;
    },

    addToQueue: function(parent) {
      layoutQueue[parent.cid] = parent;
    },

    flushQueue: function() {
      for (var cid in layoutQueue) {
        layoutQueue[cid]._flushLayout();
      }
      layoutQueue = {};
    }

  };

  var layoutQueue = {};

  var encoders = {
    width: tabris.Layout.encodeSize,
    height: tabris.Layout.encodeSize,
    left: tabris.Layout.encodeEdge,
    right: tabris.Layout.encodeEdge,
    top: tabris.Layout.encodeEdge,
    bottom: tabris.Layout.encodeEdge,
    centerX: tabris.Layout.encodeSize,
    centerY: tabris.Layout.encodeSize,
    baseline: tabris.Layout.encodeRef
  };

  function encodeStringList(value) {
    var array = value.split(/\s+/);
    array[1] = parseFloat(array[1]);
    return encodeArray(array);
  }

  function encodeArray(array) {
    if (array.length !== 2) {
      throw new Error("list length must be 2");
    }
    var ref = array[0];
    var offset = array[1];
    if (isPercentage(ref)) {
      ref = parseInt(ref);
    } else if (!isNumber(ref) && !isWidgetRef(ref)) {
      throw new Error("first element must be a percentage or a widget reference");
    }
    if (!isNumber(offset)) {
      throw new Error("second element must be a number");
    }
    return ref === 0 ? offset : [ref, offset];
  }

  function decodeArray(array) {
    if (array[0] === 0) {
      return array[1];
    }
    if (array[1] === 0) {
      return isNumber(array[0]) ? array[0] + "%" : array[0];
    }
    return [isNumber(array[0]) ? array[0] + "%" : array[0], array[1]];
  }

  function resolveAttribute(value, widget) {
    if (Array.isArray(value)) {
      return resolveArray(value, widget);
    }
    if (isNumber(value)) {
      return value;
    }
    return toProxyId(value, widget);
  }

  function resolveArray(array, widget) {
    if (isNumber(array[0])) {
      return array;
    }
    return [toProxyId(array[0], widget), array[1]];
  }

  function toProxyId(ref, widget) {
    if (ref === "prev()") {
      var children = getParent(widget).children();
      var index = children.indexOf(widget);
      if (index > 0) {
        return tabris.PropertyTypes.proxy.encode(children[index - 1]) || 0;
      }
      return 0;
    }
    if (typeof ref === "string") {
      var proxy = getParent(widget).children(ref)[0];
      return tabris.PropertyTypes.proxy.encode(proxy) || 0;
    }
    return tabris.PropertyTypes.proxy.encode(ref) || 0;
  }

  function isStringList(value) {
    return typeof value === "string" && value.indexOf(" ") !== -1;
  }
  function isPercentage(value) {
    return typeof value === "string" && value[value.length - 1] === "%" && !isNaN(parseInt(value));
  }

  function isNumber(value) {
    return typeof value === "number" && isFinite(value);
  }

  function isWidgetRef(value) {
    if (value instanceof tabris.Proxy) {
      return true;
    }
    if (typeof value === "string") {
      return value === "prev()" || selectorRegex.test(value);
    }
    return false;
  }

  function getParent(widget) {
    return widget.parent() || emptyParent;
  }

  var selectorRegex = /^(\*|([#.]?[A-Za-z0-9_-]+))$/;

  var emptyParent = {
    children: function() {
      return [];
    }
  };

}());
