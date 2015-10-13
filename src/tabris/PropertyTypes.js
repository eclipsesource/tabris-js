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
      encode: function(number) {
        checkValidNumber(number);
        return number;
      }
    },

    natural: {
      encode: function(number) {
        checkValidNumber(number);
        if (number < 0) {
          return 0;
        }
        return Math.round(number);
      }
    },

    integer: {
      encode: function(number) {
        checkValidNumber(number);
        return Math.round(number);
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
        return _.fontStringToArray(value);
      },
      decode: function(value) {
        if (!value) {
          // NOTE: workaround to allow triggering a change event when setting font to "initial"
          return "initial";
        }
        return _.fontArrayToString(value);
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
      }
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
        checkValidNumber(value);
        if (value < 0 || value > 1) {
          throw new Error("Number is out of bounds: " + value);
        }
        return value;
      }
    },

    transform: {
      encode: function(value) {
        for (var key in value) {
          if (!(key in transformDefaults)) {
            throw new Error("Not a valid transformation containing \"" + key + "\"");
          }
          checkValidNumber(value[key]);
        }
        return _.extend({}, transformDefaults, value);
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
        return value.concat();
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

  function checkValidNumber(number) {
    if (typeof number !== "number") {
      throw new Error(typeof number + " is not a number: " + number);
    }
    if (isNaN(number) || number === Infinity || number === -Infinity) {
      throw new Error("Number is not a valid value: " + number);
    }
  }

  var transformDefaults = {
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    translationX: 0,
    translationY: 0
  };

}());
