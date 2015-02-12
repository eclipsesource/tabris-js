(function() {

  tabris.PropertyEncoding = {

    boolean: function(bool) {
      return !!bool;
    },

    string: function(str) {
      return "" + str;
    },

    natural: function(number) {
      if (typeof number !== "number") {
        throw new Error(typeof number + " is not a number: " + number);
      }
      if (isNaN(number) || number === Infinity || number === -Infinity) {
        throw new Error("Number is not a valid value: " + number);
      }
      if (number < 0) {
        return 0;
      }
      return Math.round(number);
    },

    integer: function(number) {
      if (typeof number !== "number") {
        throw new Error(typeof number + " is not a number: " + number);
      }
      if (isNaN(number) || number === Infinity || number === -Infinity) {
        throw new Error("Number is not a valid value: " + number);
      }
      return Math.round(number);
    },

    choice: function(value, acceptable) {
      if (Array.isArray(acceptable)) {
        if (acceptable.indexOf(value) === -1) {
          throwNotAcceptedError(acceptable, value);
        }
        return value;
      }
      if (!(value in acceptable)) {
        throwNotAcceptedError(Object.keys(acceptable), value);
      }
      return acceptable[value];
    },

    color: function(value) {
      if (value === "initial") {
        return null;
      }
      return util.colorStringToArray(value);
    },

    font: function(value) {
      if (value === "initial") {
        return null;
      }
      return util.fontStringToArray(value);
    },

    image: function(value) {
      if (typeof value === "string") {
        value = {src: value};
      }
      if (!value || typeof value !== "object") {
        throw new Error("Not an image: " + value);
      }
      if (typeof value.src !== "string") {
        throw new Error("image.src is not a string");
      }
      if (value.src === "") {
        throw new Error("image.src is an empty string");
      }
      ["scale", "width", "height"].forEach(function(prop) {
        if (prop in value && !isDimension(value[prop])) {
          throw new Error("image." + prop + " is not a dimension: " + value[prop]);
        }
      });
      if ("scale" in value && ("width" in value || "height" in value)) {
        console.warn("Image scale is ignored if width or height are given");
      }
      return util.imageToArray(value);
    },

    layoutData: function(value) {
      if (!value) {
        return null;
      }
      var layoutData = checkLayoutData(value);
      return computeLayoutData.bind(window, layoutData);
    },

    bounds: function(value) {
      return [value.left, value.top, value.width, value.height];
    },

    proxy: function(value) {
      if (value instanceof tabris.Proxy) {
        return value.cid;
      }
      if (value instanceof tabris.ProxyCollection) {
        return value[0] ? value[0].cid : null;
      }
      return value;
    },

    nullable: function(value, altCheck) {
      if (value === null) {
        return value;
      }
      return tabris.PropertyEncoding[altCheck](value);
    }

  };

  function isDimension(value) {
    return typeof value === "number" && !isNaN(value) && value >= 0 && value !== Infinity;
  }

  function throwNotAcceptedError(acceptable, given) {
    var message = ["Accepting \""];
    message.push(acceptable.join("\", \""));
    message.push("\", given was: \"", given + "\"");
    throw new Error(message.join(""));
  }

  function checkLayoutData(layoutData) {
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
  }

  function computeLayoutData(layoutData, targetWidget, force) {
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
