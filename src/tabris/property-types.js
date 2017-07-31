import {normalizePathUrl} from './util';
import {imageToArray, imageFromArray} from './util-images';
import {colorArrayToString, colorStringToArray} from './util-colors';
import {fontObjectToString, fontStringToObject} from './util-fonts';
import NativeObject from './NativeObject';
import WidgetCollection from './WidgetCollection';

export let types = {

  any: {},

  boolean: {
    encode(bool) {
      return !!bool;
    }
  },

  string: {
    encode(str) {
      return str == null ? '' : '' + str;
    }
  },

  number: {
    encode(value) {
      return encodeNumber(value);
    }
  },

  natural: {
    encode(value) {
      value = encodeNumber(value);
      return value < 0 ? 0 : Math.round(value);
    }
  },

  integer: {
    encode(value) {
      value = encodeNumber(value);
      return Math.round(value);
    }
  },

  function: {
    encode(value) {
      if ('function' !== typeof value) {
        throw new Error(typeof value + ' is not a function: ' + value);
      }
      return value;
    }
  },

  choice: {
    encode(value, acceptable) {
      if (acceptable.indexOf(value) === -1) {
        throwNotAcceptedError(acceptable, value);
      }
      return value;
    }
  },

  color: {
    encode(value) {
      if (value === null || value === 'initial') {
        return undefined;
      }
      return colorStringToArray(value);
    },
    decode(value) {
      if (!value) {
        // NOTE: null is only returned for "background" where it means "no background"
        return 'rgba(0, 0, 0, 0)';
      }
      return colorArrayToString(value);
    }
  },

  font: {
    encode(value) {
      if (value === null || value === 'initial') {
        return undefined;
      }
      return fontStringToObject(value);
    },
    decode(value) {
      if (!value) {
        // NOTE: workaround to allow triggering a change event when setting font to "initial"
        return 'initial';
      }
      return fontObjectToString(value);
    }
  },

  image: {
    encode(value) {
      if (!value) {
        return null;
      }
      if (typeof value === 'string') {
        value = {src: value};
      }
      if (typeof value !== 'object') {
        throw new Error('Not an image: ' + value);
      }
      try {
        value.src = normalizePathUrl(value.src);
      } catch (err) {
        throw new Error('Invalid image.src: ' + err.message);
      }
      ['scale', 'width', 'height'].forEach((prop) => {
        if (prop in value && !isDimension(value[prop])) {
          throw new Error('image.' + prop + ' is not a dimension: ' + value[prop]);
        }
      });
      if ('scale' in value && ('width' in value || 'height' in value)) {
        console.warn('Image scale is ignored if width or height are given');
      }
      return imageToArray(value);
    },
    decode(value) {
      if (!value) {
        return null;
      }
      return imageFromArray(value);
    }
  },

  layoutData: {
    encode(value) {
      return encodeLayoutData(value);
    },
    decode(value) {
      return decodeLayoutData(value);
    }
  },

  edge: {
    encode(value) {
      return value == null ? null : encodeEdge(value);
    },
    decode: decodeLayoutAttr
  },

  dimension: {
    encode(value) {
      return value == null ? null : encodeNumber(value);
    },
    decode: decodeLayoutAttr
  },

  sibling: {
    encode(value) {
      return value == null ? null : encodeWidgetRef(value);
    },
    decode: decodeLayoutAttr
  },

  bounds: {
    encode(value) {
      return [value.left, value.top, value.width, value.height];
    },
    decode(value) {
      return {left: value[0], top: value[1], width: value[2], height: value[3]};
    }
  },

  proxy: {
    encode(value) {
      if (value instanceof NativeObject) {
        return value.cid;
      }
      if (value instanceof WidgetCollection) {
        return value[0] ? value[0].cid : null;
      }
      // TODO: Should throw error instead
      return value;
    },
    decode(cid) {
      return tabris._proxies.find(cid);
    }
  },

  nullable: {
    encode(value, altCheck) {
      if (value === null) {
        return value;
      }
      return types[altCheck].encode(value);
    }
  },

  opacity: {
    encode(value) {
      value = encodeNumber(value);
      return Math.max(0, Math.min(1, value));
    }
  },

  transform: {
    encode(value) {
      let result = Object.assign({}, transformDefaults);
      for (let key in value) {
        if (!(key in transformDefaults)) {
          throw new Error('Not a valid transformation containing "' + key + '"');
        }
        result[key] = encodeNumber(value[key]);
      }
      return result;
    }
  },

  array: {
    encode(value, type) {
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

let numberRegex = /^[+-]?([0-9]+|[0-9]*\.[0-9]+)$/;
let selectorRegex = /^(\*|prev\(\)|([#.]?[A-Za-z_][A-Za-z0-9_-]+))$/;

function isDimension(value) {
  return typeof value === 'number' && !isNaN(value) && value >= 0 && value !== Infinity;
}

function throwNotAcceptedError(acceptable, given) {
  let message = ['Accepting "'];
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

let transformDefaults = {
  rotation: 0,
  scaleX: 1,
  scaleY: 1,
  translationX: 0,
  translationY: 0,
  translationZ: 0
};

let layoutEncoders = {
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
  let result = {};
  for (let key in layoutData) {
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
      let percentage = encodePercentage(value);
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
  let ref = encodeEdgeRef(array[0]);
  let offset = encodeNumber(array[1]);
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
  let sub = value.substr(0, value.length - 1);
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
  let result = {};
  for (let key in layoutData) {
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
