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
        return tabris.Layout.encodeLayoutData(value);
      },
      decode: function(value) {
        return tabris.Layout.decodeLayoutData(value);
      }
    },

    edge: {
      encode: function(value) {
        return value == null ? null : tabris.Layout.encodeEdge(value);
      },
      decode: function(value) {
        return tabris.Layout.decodeAttribute(value);
      }
    },

    dimension: {
      encode: function(value) {
        return value == null ? null : tabris.Layout.encodeSize(value);
      },
      decode: function(value) {
        return tabris.Layout.decodeAttribute(value);
      }
    },

    sibling: {
      encode: function(value) {
        return value == null ? null : tabris.Layout.encodeRef(value);
      },
      decode: function(value) {
        return tabris.Layout.decodeAttribute(value);
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

}());
