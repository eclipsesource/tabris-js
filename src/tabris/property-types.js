import {extend} from './util';
import {imageToArray, imageFromArray} from './util-images';
import {colorArrayToString, colorStringToArray} from './util-colors';
import {fontObjectToString, fontStringToObject} from './util-fonts';
import NativeObject from './NativeObject';
import WidgetCollection from './WidgetCollection';

export var types = {

  any: {},

  boolean: {
    encode: function(bool) {
      return !!bool;
    }
  },

  string: {
    encode: function(str) {
      return '' + str;
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
      if ('function' !== typeof value) {
        throw new Error(typeof value + ' is not a function: ' + value);
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
      if (value === 'initial') {
        return undefined;
      }
      return colorStringToArray(value);
    },
    decode: function(value) {
      if (!value) {
        // NOTE: null is only returned for "background" where it means "no background"
        return 'rgba(0, 0, 0, 0)';
      }
      return colorArrayToString(value);
    }
  },

  font: {
    encode: function(value) {
      if (value === 'initial') {
        return undefined;
      }
      return fontStringToObject(value);
    },
    decode: function(value) {
      if (!value) {
        // NOTE: workaround to allow triggering a change event when setting font to "initial"
        return 'initial';
      }
      return fontObjectToString(value);
    }
  },

  image: {
    encode: function(value) {
      if (!value) {
        return null;
      }
      if (typeof value === 'string') {
        value = {src: value};
      }
      if (typeof value !== 'object') {
        throw new Error('Not an image: ' + value);
      }
      if (typeof value.src !== 'string') {
        throw new Error('image.src is not a string');
      }
      if (value.src === '') {
        throw new Error('image.src is an empty string');
      }
      ['scale', 'width', 'height'].forEach(function(prop) {
        if (prop in value && !isDimension(value[prop])) {
          throw new Error('image.' + prop + ' is not a dimension: ' + value[prop]);
        }
      });
      if ('scale' in value && ('width' in value || 'height' in value)) {
        console.warn('Image scale is ignored if width or height are given');
      }
      return imageToArray(value);
    },
    decode: function(value) {
      if (!value) {
        return null;
      }
      return imageFromArray(value);
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
    decode: decodeLayoutAttr
  },

  dimension: {
    encode: function(value) {
      return value == null ? null : encodeNumber(value);
    },
    decode: decodeLayoutAttr
  },

  sibling: {
    encode: function(value) {
      return value == null ? null : encodeWidgetRef(value);
    },
    decode: decodeLayoutAttr
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
      if (value instanceof NativeObject) {
        return value.cid;
      }
      if (value instanceof WidgetCollection) {
        return value[0] ? value[0].cid : null;
      }
      // TODO: Should throw error instead
      return value;
    },
    decode: function(cid) {
      return tabris._proxies.find(cid);
    }
  },

  nullable: {
    encode: function(value, altCheck) {
      if (value === null) {
        return value;
      }
      return types[altCheck].encode(value);
    }
  },

  opacity: {
    encode: function(value) {
      value = encodeNumber(value);
      if (value < 0 || value > 1) {
        throw new Error('Number is out of bounds: ' + value);
      }
      return value;
    }
  },

  transform: {
    encode: function(value) {
      var result = extend({}, transformDefaults);
      for (var key in value) {
        if (!(key in transformDefaults)) {
          throw new Error('Not a valid transformation containing "' + key + '"');
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
        throw new Error(typeof value + ' is not an array: ' + value);
      }
      if (type) {
        return value.map(types[type].encode);
      }
      return value;
    }
  }

};

var numberRegex = /^[+-]?([0-9]+|[0-9]*\.[0-9]+)$/;
var selectorRegex = /^(\*|prev\(\)|([#.]?[A-Za-z_][A-Za-z0-9_-]+))$/;

function isDimension(value) {
  return typeof value === 'number' && !isNaN(value) && value >= 0 && value !== Infinity;
}

function throwNotAcceptedError(acceptable, given) {
  var message = ['Accepting "'];
  message.push(acceptable.join('", "'));
  message.push('", given was: "', given + '"');
  throw new Error(message.join(''));
}

function encodeNumber(value) {
  if (typeof value === 'string' && numberRegex.test(value)) {
    return parseFloat(value);
  }
  if (typeof value !== 'number') {
    throw new Error('Not a number: ' + toString(value));
  }
  if (!isFinite(value)) {
    throw new Error('Invalid number: ' + toString(value));
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
  width: encodeNumber,
  height: encodeNumber,
  left: encodeEdge,
  right: encodeEdge,
  top: encodeEdge,
  bottom: encodeEdge,
  centerX: encodeNumber,
  centerY: encodeNumber,
  baseline: encodeWidgetRef
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

function encodeEdge(value) {
  if (typeof value === 'string') {
    if (value.indexOf(' ') !== -1) {
      return encodeEdgeArray(value.split(/\s+/));
    }
    if (value[value.length - 1] === '%') {
      var percentage = encodePercentage(value);
      return percentage === 0 ? 0 : [percentage, 0];
    }
    if (numberRegex.test(value)) {
      return [0, parseFloat(value)];
    }
    if (selectorRegex.test(value)) {
      return [value, 0];
    }
    throw new Error('Invalid dimension: ' + toString(value));
  }
  if (typeof value === 'number') {
    if (!isFinite(value)) {
      throw new Error('Invalid number: ' + toString(value));
    }
    return value;
  }
  if (Array.isArray(value)) {
    return encodeEdgeArray(value);
  }
  if (value instanceof NativeObject) {
    return [value, 0];
  }
  throw new Error('Invalid dimension: ' + toString(value));
}

function encodeEdgeArray(array) {
  if (array.length !== 2) {
    throw new Error('Wrong number of elements (must be 2): ' + toString(array));
  }
  var ref = encodeEdgeRef(array[0]);
  var offset = encodeNumber(array[1]);
  return ref === 0 ? offset : [ref, offset];
}

function encodeEdgeRef(value) {
  if (typeof value === 'string') {
    if (value[value.length - 1] === '%') {
      return encodePercentage(value);
    }
    if (selectorRegex.test(value)) {
      return value;
    }
  }
  if (typeof value === 'number') {
    if (!isFinite(value)) {
      throw new Error('Invalid number: ' + toString(value));
    }
    return value;
  }
  if (value instanceof NativeObject) {
    return value;
  }
  throw new Error('Not a percentage or widget reference: ' + toString(value));
}

function encodePercentage(value) {
  var sub = value.substr(0, value.length - 1);
  if (numberRegex.test(sub)) {
    return parseFloat(sub);
  }
  throw new Error('Invalid percentage value: ' + toString(value));
}

function encodeWidgetRef(value) {
  if (value instanceof NativeObject) {
    return value;
  }
  if (typeof value === 'string' && selectorRegex.test(value)) {
    return value;
  }
  throw new Error('Not a widget reference: ' + toString(value));
}

function decodeLayoutData(layoutData) {
  if (!layoutData) {
    return null;
  }
  var result = {};
  for (var key in layoutData) {
    result[key] = decodeLayoutAttr(layoutData[key]);
  }
  return result;
}

function decodeLayoutAttr(value) {
  if (Array.isArray(value)) {
    if (value[0] === 0) {
      return value[1];
    }
    if (value[1] === 0) {
      return typeof value[0] === 'number' ? value[0] + '%' : value[0];
    }
    return [typeof value[0] === 'number' ? value[0] + '%' : value[0], value[1]];
  }
  return value;
}

function toString(value) {
  if (typeof value === 'string') {
    return "'" + value + "'";
  }
  if (Array.isArray(value)) {
    return '[' + value.map(toString).join(', ') + ']';
  }
  if (typeof value === 'object' && value != null) {
    return '{' + Object.keys(value).join(', ') + '}';
  }
  return '' + value;
}
