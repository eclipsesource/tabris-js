import {imageFromArray, imageToArray} from './util-images';
import NativeObject from './NativeObject';
import WidgetCollection from './WidgetCollection';
import Color from './Color';
import Image from './Image';
import Font from './Font';
import LinearGradient from './LinearGradient';

export const types = {

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

  dimension: {
    encode(value) {
      return value == null ? null : encodeNumber(value);
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

  shader: {
    encode(value) {
      if (value === null || value === 'initial') {
        return undefined;
      }
      if (LinearGradient.isValidLinearGradientValue(value)) {
        const {colorStops, direction} = LinearGradient.from(value);
        return {
          type: 'linearGradient',
          colors: colorStops.map(stop =>
            Color.isValidColorValue(stop) ? [stop.toArray(), null] :
              [stop[0].toArray(), stop[1].valueOf() / 100]
          ),
          angle: direction
        };
      } else if (Color.isValidColorValue(value)) {
        return {type: 'color', color: Color.from(value).toArray()};
      }
      throw new Error(value + ' must be a valid LinearGradientValue or ColorValue.');
    },
    decode(value) {
      if (!value) {
        // NOTE: null is only returned for "background" where it means "no background"
        return 'rgba(0, 0, 0, 0)';
      }
      if (value.type === 'color') {
        return Color.from(value.color);
      } else if (value.type === 'linearGradient') {
        return LinearGradient.from({
          colorStops: value.colors.map(([color, offset]) =>
            offset !== null ? [Color.from(color), {percent: offset * 100}] :
              Color.from(color)
          ),
          direction: value.angle
        });
      } else if (value instanceof Array) {
        return Color.from(value);
      }
      return value;
    }
  },

  ColorValue: {
    encode(value) {
      if (value === null || value === 'initial') {
        return undefined;
      }
      return Color.from(value).toArray();
    },
    decode(value) {
      if (!value) {
        // NOTE: null is only returned for "background" where it means "no background"
        return Color.transparent;
      }
      return Color.from(value);
    }
  },

  FontValue: {
    encode(value) {
      if (value === null || value === 'initial') {
        return undefined;
      }
      return Font.from(value);
    },
    decode(value) {
      if (!value) {
        // NOTE: workaround to allow triggering a change event when setting font to "initial"
        return 'initial';
      }
      return Font.from(value).toString();
    }
  },

  boxDimensions: {
    encode(value) {
      if (value === 'initial') {
        return undefined;
      }
      if (value === null || typeof value === 'number') {
        return {left: value || 0, right: value || 0, top: value || 0, bottom: value || 0};
      }
      if (typeof value === 'object') {
        return {
          left: typeof value.left === 'number' ? value.left : 0,
          top: typeof value.top === 'number' ? value.top : 0,
          right: typeof value.right === 'number' ? value.right : 0,
          bottom: typeof value.bottom === 'number' ? value.bottom : 0
        };
      }
      throw new Error('Invalid type: ' + value);
    }
  },

  ImageValue: {
    encode(value) {
      if (!value) {
        return null;
      }
      return imageToArray(Image.from(value));
    },
    decode(value) {
      if (!value) {
        return null;
      }
      return imageFromArray(value);
    }
  },

  bounds: {
    encode(value) {
      return [value.left, value.top, value.width, value.height];
    },
    decode(value) {
      return {left: value[0], top: value[1], width: value[2], height: value[3]};
    }
  },

  NativeObject: {
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
      return tabris._nativeObjectRegistry.find(cid);
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
      const result = Object.assign({}, transformDefaults);
      for (const key in value) {
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

const numberRegex = /^[+-]?([0-9]+|[0-9]*\.[0-9]+)$/;

function throwNotAcceptedError(acceptable, given) {
  const message = ['Accepting "'];
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

const transformDefaults = {
  rotation: 0,
  scaleX: 1,
  scaleY: 1,
  translationX: 0,
  translationY: 0,
  translationZ: 0
};

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
