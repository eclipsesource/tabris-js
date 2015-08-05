(function() {

  tabris.Layout = {

    encodeLayoutData: function(layoutData) {
      return encodeAttributes(checkConsistency(layoutData));
    },

    decodeLayoutData: function(layoutData) {
      return decodeAttributes(layoutData);
    },

    resolveReferences: function(layoutData, targetWidget) {
      if (!targetWidget) {
        return layoutData;
      }
      var result = {};
      var parent = targetWidget.parent() || emptyParent;
      for (var key in layoutData) {
        result[key] = resolveAttribute(layoutData[key], parent);
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

  function checkConsistency(layoutData) {
    if ("centerX" in layoutData) {
      if (("left" in layoutData) || ("right" in layoutData)) {
        console.warn("Inconsistent layoutData: centerX overrides left and right");
        return _.omit(layoutData, ["left", "right"]);
      }
    }
    if ("baseline" in layoutData) {
      if (("top" in layoutData) || ("bottom" in layoutData) || ("centerY" in layoutData)) {
        console.warn("Inconsistent layoutData: baseline overrides top, bottom, and centerY");
        return _.omit(layoutData, ["top", "bottom", "centerY"]);
      }
    } else if ("centerY" in layoutData) {
      if (("top" in layoutData) || ("bottom" in layoutData)) {
        console.warn("Inconsistent layoutData: centerY overrides top and bottom");
        return _.omit(layoutData, ["top", "bottom"]);
      }
    }
    return layoutData;
  }

  function encodeAttributes(layoutData) {
    var result = {};
    for (var key in layoutData) {
      if (!(key in encoders)) {
        throw new Error("Invalid key '" + key + "' in layoutData");
      }
      try {
        result[key] = encoders[key](layoutData[key]);
      } catch (error) {
        throw new Error("Invalid value for '" + key + "': " + error.message);
      }
    }
    return result;
  }

  var encoders = {
    width: encodeSize,
    height: encodeSize,
    left: encodeEdge,
    right: encodeEdge,
    top: encodeEdge,
    bottom: encodeEdge,
    centerX: encodeSize,
    centerY: encodeSize,
    baseline: encodeRef
  };

  function encodeEdge(value) {
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
  }

  function encodeArray(array) {
    if (array.length !== 2) {
      throw new Error("array length must be 2");
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

  function encodeSize(value) {
    if (!isNumber(value)) {
      throw new Error("must be a number");
    }
    return value;
  }

  function encodeRef(value) {
    if (!isWidgetRef(value)) {
      throw new Error("must be a widget reference");
    }
    return value;
  }

  function decodeAttributes(layoutData) {
    if (!layoutData) {
      return null;
    }
    var result = {};
    for (var key in layoutData) {
      result[key] = decodeAttribute(layoutData[key]);
    }
    return result;
  }

  function decodeAttribute(value) {
    return Array.isArray(value) ? decodeArray(value) : value;
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

  function resolveAttribute(value, parent) {
    if (Array.isArray(value)) {
      return resolveArray(value, parent);
    }
    if (isNumber(value)) {
      return value;
    }
    return toProxyId(value, parent);
  }

  function resolveArray(array, parent) {
    if (isNumber(array[0])) {
      return array;
    }
    return [toProxyId(array[0], parent), array[1]];
  }

  function toProxyId(ref, parent) {
    if (typeof ref === "string") {
      var proxy = parent.children(ref)[0];
      return tabris.PropertyTypes.proxy.encode(proxy) || 0;
    }
    return tabris.PropertyTypes.proxy.encode(ref) || 0;
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
      return selectorRegex.test(value);
    }
    return false;
  }

  var selectorRegex = /^(\*|([#.]?[A-Za-z0-9_-]+))$/;

  var emptyParent = {
    children: function() {
      return [];
    }
  };

}());
