(function() {

  tabris.PropertyTypes = {

    any: {},

    boolean: {
      encode: function(bool) {
        return !!bool;
      }
    },

    string: {
      encode: function(str) {
        return "" + str;
      }
    },

    number: {
      encode: function(value) {
        return encodeNumber(value);
      }
    },

    natural: {
      encode: function(value) {
        value = encodeNumber(value);
        return value < 0 ? 0 : Math.round(value);
      }
    },

    integer: {
      encode: function(value) {
        value = encodeNumber(value);
        return Math.round(value);
      }
    },

    function: {
      encode: function(value) {
        if ("function" !== typeof value) {
          throw new Error(typeof value + " is not a function: " + value);
        }
        return value;
      }
    },

    choice: {
      encode: function(value, acceptable) {
        if (acceptable.indexOf(value) === -1) {
          throwNotAcceptedError(acceptable, value);
        }
        return value;
      }
    },

    color: {
      encode: function(value) {
        if (value === "initial") {
          return undefined;
        }
        return _.colorStringToArray(value);
      },
      decode: function(value) {
        if (!value) {
          // NOTE: null is only returned for "background" where it means "no background"
          return "rgba(0, 0, 0, 0)";
        }
        return _.colorArrayToString(value);
      }
    },

    font: {
      encode: function(value) {
        if (value === "initial") {
          return undefined;
        }
        return _.fontStringToObject(value);
      },
      decode: function(value) {
        if (!value) {
          // NOTE: workaround to allow triggering a change event when setting font to "initial"
          return "initial";
        }
        return _.fontObjectToString(value);
      }
    },

    image: {
      encode: function(value) {
        if (!value) {
          return null;
        }
        if (typeof value === "string") {
          value = {src: value};
        }
        if (typeof value !== "object") {
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
        return _.imageToArray(value);
      },
      decode: function(value) {
        if (!value) {
          return null;
        }
        return _.imageFromArray(value);
      }
    },

    layoutData: {
      encode: function(value) {
        return encodeLayoutData(value);
      },
      decode: function(value) {
        return decodeLayoutData(value);
      }
    },

    edge: {
      encode: function(value) {
        return value == null ? null : encodeEdge(value);
      },
      decode: function(value) {
        return decodeAttribute(value);
      }
    },

    dimension: {
      encode: function(value) {
        return value == null ? null : encodeSize(value);
      },
      decode: function(value) {
        return decodeAttribute(value);
      }
    },

    sibling: {
      encode: function(value) {
        return value == null ? null : encodeRef(value);
      },
      decode: function(value) {
        return decodeAttribute(value);
      }
    },

    bounds: {
      encode: function(value) {
        return [value.left, value.top, value.width, value.height];
      },
      decode: function(value) {
        return {left: value[0], top: value[1], width: value[2], height: value[3]};
      }
    },

    proxy: {
      encode: function(value) {
        if (value instanceof tabris.Proxy) {
          return value.cid;
        }
        if (value instanceof tabris.ProxyCollection) {
          return value[0] ? value[0].cid : null;
        }
        // TODO: Should throw error instead
        return value;
      },
      decode: tabris
    },

    nullable: {
      encode: function(value, altCheck) {
        if (value === null) {
          return value;
        }
        return tabris.PropertyTypes[altCheck].encode(value);
      }
    },

    opacity: {
      encode: function(value) {
        value = encodeNumber(value);
        if (value < 0 || value > 1) {
          throw new Error("Number is out of bounds: " + value);
        }
        return value;
      }
    },

    transform: {
      encode: function(value) {
        var result = _.extend({}, transformDefaults);
        for (var key in value) {
          if (!(key in transformDefaults)) {
            throw new Error("Not a valid transformation containing \"" + key + "\"");
          }
          result[key] = encodeNumber(value[key]);
        }
        return result;
      }
    },

    array: {
      encode: function(value, type) {
        if (value == null) {
          return [];
        }
        if (!(value instanceof Array)) {
          throw new Error(typeof value + " is not an array: " + value);
        }
        if (type) {
          return value.map(tabris.PropertyTypes[type].encode);
        }
        return value;
      }
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

  function encodeNumber(value) {
    var regex = /^\-?([0-9]+|[0-9]*\.[0-9]+)$/;
    if (typeof value === "string" && regex.test(value)) {
      return parseFloat(value);
    }
    if (typeof value !== "number") {
      throw new Error(typeof value + " is not a number: " + value);
    }
    if (isNaN(value) || value === Infinity || value === -Infinity) {
      throw new Error("Invalid number: " + value);
    }
    return value;
  }

  var transformDefaults = {
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    translationX: 0,
    translationY: 0,
    translationZ: 0
  };

  var layoutEncoders = {
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

  function encodeLayoutData(layoutData) {
    var result = {};
    for (var key in layoutData) {
      if (layoutData[key] != null) {
        if (!(key in layoutEncoders)) {
          throw new Error("Invalid key '" + key + "' in layoutData");
        }
        try {
          result[key] = layoutEncoders[key](layoutData[key]);
        } catch (error) {
          throw new Error("Invalid value for '" + key + "': " + error.message);
        }
      }
    }
    return result;
  }

  function encodeSize(value) {
    if (!isNumber(value)) {
      throw new Error("must be a number");
    }
    return value;
  }

  function encodeEdge(value) {
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
  }

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

  function encodeRef(value) {
    if (!isWidgetRef(value)) {
      throw new Error("must be a widget reference");
    }
    return value;
  }

  function decodeLayoutData(layoutData) {
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

  function isStringList(value) {
    return typeof value === "string" && value.indexOf(" ") !== -1;
  }

  function isPercentage(value) {
    return typeof value === "string" && value[value.length - 1] === "%" && !isNaN(parseInt(value));
  }

  function isWidgetRef(value) {
    var selectorRegex = /^(\*|([#.]?[A-Za-z0-9_-]+))$/;
    if (value instanceof tabris.Proxy) {
      return true;
    }
    if (typeof value === "string") {
      return value === "prev()" || selectorRegex.test(value);
    }
    return false;
  }

  function isNumber(value) {
    return typeof value === "number" && isFinite(value);
  }

}());
