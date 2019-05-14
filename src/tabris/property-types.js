import {imageFromArray, imageToArray} from './util-images';
import NativeObject from './NativeObject';
import WidgetCollection from './WidgetCollection';
import Color from './Color';
import Image from './Image';
import Font from './Font';
import LinearGradient from './LinearGradient';
import {toValueString} from './Console';

export const types = {

  any: {},

  boolean: {
    encode(bool) {
      return !!bool;
    },
    decode(value) {
      return value === undefined ? false : value;
    }
  },

  string: {
    encode(str) {
      return str == null ? '' : '' + str;
    },
    decode(value) {
      return value === undefined ? '' : value;
    }
  },

  number: {
    encode(value) {
      return encodeNumber(value);
    },
    decode(value) {
      return value === undefined ? 0 : value;
    }
  },

  natural: {
    encode(value) {
      value = encodeNumber(value);
      return value < 0 ? 0 : Math.round(value);
    },
    decode(value) {
      return value === undefined ? 0 : value;
    }

  },

  integer: {
    encode(value) {
      value = encodeNumber(value);
      return Math.round(value);
    },
    decode(value) {
      return value === undefined ? 0 : value;
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
        throw new Error(`${toValueString(value)} + ' is not a function`);
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
      if (isLinearGradientValue(value)) {
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
      } else if (Image.isValidImageValue(value)) {
        return {type: 'image', image: imageToArray(Image.from.call(this, value))};
      }
      throw new Error(`${toValueString(value)} must be a valid LinearGradientValue or ColorValue.`);
    },
    decode(value) {
      if (!value) {
        return 'initial';
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
      } else if (value.type === 'image') {
        return Image.from(imageFromArray(value.image));
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
        return 'initial';
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
      if (value instanceof Array || typeof value === 'string') {
        let arr = typeof value === 'string' ? value.trim().split(/\s+/) : value;
        try {
          if (arr.length === 0 || arr.length > 4) {
            throw new Error();
          }
          arr = arr.map(encodePx);
        } catch (ex) {
          throw new Error(`${toValueString(value)} is not a valid BoxDimension value`);
        }
        return {
          top: arr[0],
          right: arr.length > 1 ? arr[1] : arr[0],
          bottom: arr.length > 2 ? arr[2] : arr[0],
          left: arr.length > 3 ? arr[3] : arr.length > 1 ? arr[1] : arr[0]
        };
      }
      if (typeof value === 'object') {
        return {
          left: 'left' in value ? encodePx(value.left) : 0,
          top: 'top' in value ? encodePx(value.top) : 0,
          right: 'right' in value ? encodePx(value.right) : 0,
          bottom: 'bottom' in value ? encodePx(value.bottom) : 0
        };
      }
      throw new Error(`${toValueString(value)} is not a valid BoxDimension value`);
    }
  },

  ImageValue: {
    encode(value) {
      if (!value) {
        return null;
      }
      return imageToArray(Image.from.call(this, value));
    },
    decode(value) {
      if (!value) {
        return null;
      }
      return Image.from(imageFromArray(value));
    }
  },

  bounds: {
    encode(value) {
      return [value.left, value.top, value.width, value.height];
    },
    decode(value) {
      if (value === undefined) {
        return {left: 0, top: 0, width: 0, height: 0};
      }
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
          throw new Error(`${toValueString(value)} is not a valid transformation containing key "${key}"`);
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
        throw new Error(`${toValueString(value)} is not an Array`);
      }
      if (type) {
        return value.map(types[type].encode);
      }
      return value;
    }
  }

};

const numberRegex = /^[+-]?([0-9]+|[0-9]*\.[0-9]+)$/;

function isLinearGradientValue(value) {
  if (value instanceof LinearGradient) {
    return true;
  }
  if (value instanceof Object) {
    return 'colorStops' in value;
  }
  if (typeof value === 'string') {
    return /^linear-gradient/.test(value);
  }
}

function throwNotAcceptedError(acceptable, given) {
  const message = ['Accepting "'];
  message.push(acceptable.join('", "'));
  message.push('", given was: "', given + '"');
  throw new Error(message.join(''));
}

function encodePx(value) {
  if (value === null) {
    return 0;
  }
  if (typeof value === 'string') {
    return encodeNumber(value.trim().replace('px', ''));
  }
  return encodeNumber(value);
}

function encodeNumber(value) {
  if (typeof value === 'string' && numberRegex.test(value)) {
    return parseFloat(value);
  }
  if (typeof value !== 'number') {
    throw new Error(`${toValueString(value)} is not a number`);
  }
  if (!isFinite(value)) {
    throw new Error(`${toValueString(value)} is not a valid number`);
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
