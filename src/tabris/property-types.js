import NativeObject from './NativeObject';
import WidgetCollection from './WidgetCollection';
import Color from './Color';
import Image from './Image';
import Font from './Font';
import LinearGradient from './LinearGradient';
import {toValueString} from './Console';
import {allowOnlyKeys, getBytes, getNativeObject} from './util';

const numberRegex = /^[+-]?([0-9]+|[0-9]*\.[0-9]+)$/;
const transformDefaults = {
  rotation: 0,
  scaleX: 1,
  scaleY: 1,
  translationX: 0,
  translationY: 0,
  translationZ: 0
};

/**
 * @template T
 * @typedef {{
  *   convert?: (value: unknown, context?: NativeObject) => T,
  *   encode?: (value: T, context?: NativeObject) => any,
  *   decode?: (value: any, context?: NativeObject) => T
  * }} PropertyType
  */

/**
 * Note: Primitive types and aliases thereof start lower vase,
 * object types other upper case.
 */
class PropertyTypes {

  constructor() {

    const self = this;

    /** @type {PropertyType<any>} */
    this.any = {};

    /** @type {PropertyType<boolean>} */
    this.boolean = {
      convert: bool => !!bool,
      decode: value => value === undefined ? false : value
    };

    /** @type {PropertyType<string>} */
    this.string = {
      convert: str => str == null ? '' : '' + str,
      decode: value => value === undefined ? '' : value
    };

    /** @type {PropertyType<number>} */
    this.number = {
      convert: convertToNumber,
      decode: value => value === undefined ? 0 : value
    };

    /** @type {PropertyType<number>} */
    this.natural = {
      convert: value => Math.max(0, Math.round(convertToNumber(value))),
      decode: value =>  value === undefined ? 0 : value
    };

    /** @type {PropertyType<number>} */
    this.integer = {
      encode: value => Math.round(convertToNumber(value)),
      decode: value => value === undefined ? 0 : value
    };

    /** @type {PropertyType<number>} */
    this.fraction = {
      convert: value => Math.max(0, Math.min(1, convertToNumber(value)))
    };

    /** @type {PropertyType<number>} */
    this.dimension = {
      convert: value => Math.max(0, convertToNumber(value)),
      decode: value => value === undefined ? 0 : value
    };

    /** @type {PropertyType<LinearGradient|Color|Image|'initial'>} */
    this.Shader = {
      convert(value) {
        if (!value || value === 'initial') {
          return 'initial';
        }
        if (isIntendedLinearGradientValue(value)) {
          return LinearGradient.from(value);
        } else if (Color.isValidColorValue(value)) {
          return Color.from(value);
        } else if (Image.isValidImageValue(value)) {
          return Image.from.call(this, value);
        }
        throw new Error(`${toValueString(value)} must be a valid ImageValue, LinearGradientValue or ColorValue.`);
      },
      encode(value) {
        if (value === 'initial') {
          return null;
        }
        if (value instanceof LinearGradient) {
          const {colorStops, direction} = value;
          return {
            type: 'linearGradient',
            colors: colorStops.map(stop =>
              stop instanceof Color ? [stop.toArray(), null] :
                [stop[0].toArray(), stop[1].valueOf() / 100]
            ),
            angle: direction
          };
        } else if (value instanceof Color) {
          return {type: 'color', color: value.toArray()};
        } else if (value instanceof Image) {
          return {type: 'image', image: self.ImageValue.encode(value)};
        }
        throw new Error(`${toValueString(value)} must be a LinearGradient or Color instance.`);
      }
    },

    /** @type {ColorValue: PropertyType<Color|'initial'>} */
    this.ColorValue = {
      convert: value => !value || value === 'initial' ? 'initial' : Color.from(value),
      encode: value => value === 'initial' ? undefined : value.toArray(),
      decode: value => !value ? 'initial' : Color.from(value)
    };

    /** @type {PropertyType<Font|'initial'>} */
    this.FontValue = {
      convert: value => (!value || value === 'initial') ? 'initial' : Font.from(value),
      encode: value => value === 'initial' ? undefined : value
    };

    /** @type {PropertyType<Image|null>} */
    this.ImageValue = {
      convert: value => (!value || value === 'initial') ? null : Image.from(value),
      encode(value) {
        if (!value) {
          return null;
        }
        const image = Image.from.call(this, value);
        const width = image.width === 'auto' ? null : image.width;
        const height = image.height === 'auto' ? null : image.height;
        const scale = image.scale === 'auto' ? null : image.scale;
        const src = image.src;
        if (typeof src === 'string') {
          return {
            type: 'uri',
            src, width, height, scale
          };
        }
        if (getBytes(src)) {
          return {
            type: 'encodedImage',
            src: getBytes(src),
            width, height, scale
          };
        }
        return {
          type: 'imageBitmap',
          src: getNativeObject(src).cid,
          width, height, scale
        };
      }
    },

    /** @type {PropertyType<Partial<BoxDimensionsObject>|'initial'>} */
    this.BoxDimensions = {
      convert(value) {
        try {
          if (!value) {
            return Object.freeze({left: 0, right: 0, top: 0, bottom: 0});
          }
          if (typeof value === 'number') {
            const normal = self.dimension.convert(value);
            return {left: normal, right: normal, top: normal, bottom: normal};
          }
          if (value instanceof Array || typeof value === 'string') {
            const arr = (typeof value === 'string' ? value.trim().split(/\s+/) : value).map(convertToNumber);
            if (arr.length === 0 || arr.length > 4) {
              throw new Error('Array must have between 1 and 4 entries');
            }
            return Object.freeze({
              top: arr[0],
              right: arr.length > 1 ? arr[1] : arr[0],
              bottom: arr.length > 2 ? arr[2] : arr[0],
              left: arr.length > 3 ? arr[3] : arr.length > 1 ? arr[1] : arr[0]
            });
          }
          if (typeof value === 'object') {
            const partial = allowOnlyKeys(value, ['left', 'top', 'right', 'bottom']);
            return Object.freeze({
              left: 'left' in partial ? convertToNumber(partial.left) : 0,
              top: 'top' in partial ? convertToNumber(partial.top) : 0,
              right: 'right' in partial ? convertToNumber(partial.right) : 0,
              bottom: 'bottom' in partial ? convertToNumber(partial.bottom) : 0
            });
          }
          throw new Error('Expected number, string or object');
        } catch (ex) {
          throw new Error(`${toValueString(value)} is not a valid BoxDimensions value: ${ex.message}`);
        }
      }
    },

    /** @type {PropertyType<{left: number, top: number, width: number, height: number}>} */
    this.Bounds = {
      decode: /** @param {any} value*/value => value === undefined
        ? {left: 0, top: 0, width: 0, height: 0}
        : {left: value[0], top: value[1], width: value[2], height: value[3]}
    };

    /** @type {PropertyType<NativeObject|WidgetCollection>} */
    this.Widget = {
      convert(value) {
        if (!value) {
          return null;
        }
        if (value instanceof WidgetCollection) {
          return value.first() || null;
        }
        // Can't import Widget due to circular dependency, check animate method instead
        if (value instanceof NativeObject && Object.getPrototypeOf(value).animate instanceof Function) {
          return value;
        }
        throw new Error('Not a valid widget: ' + toValueString(value));
      },
      encode: value => value instanceof NativeObject ? value.cid : null,
      decode: value => tabris._nativeObjectRegistry.find(value)
    };

    /** @type {PropertyType<Partial<typeof transformDefaults>>} */
    this.Transformation = {
      convert(value) {
        const partial = allowOnlyKeys(value, Object.keys(transformDefaults));
        return Object.freeze({
          rotation: 'rotation' in partial ? convertToNumber(partial.rotation) : 0,
          scaleX: 'scaleX' in partial ? convertToNumber(partial.scaleX) : 1,
          scaleY: 'scaleY' in partial ? convertToNumber(partial.scaleY) : 1,
          translationX: 'translationX' in partial ? convertToNumber(partial.translationX) : 0,
          translationY: 'translationY' in partial ? convertToNumber(partial.translationY) : 0,
          translationZ: 'translationZ' in partial ? convertToNumber(partial.translationZ) : 0
        });
      }
    };

    /** @type {PropertyType<Date>} */
    this.Date = {
      convert(value) {
        if (!(value instanceof Date)) {
          throw new Error(`${toValueString(value)} is not of type Date`);
        }
        return value;
      },
      encode(value) {
        return value.getTime();
      }
    };

    /**
     * @param {any} value
     */
    function convertToNumber(value) {
      if (value === false || value == null || value === '') {
        return 0;
      }
      if (typeof value === 'string') {
        const fixedString = value.trim().replace('px', '');
        if (numberRegex.test(fixedString)) {
          return parseFloat(fixedString);
        }
      }
      if (typeof value !== 'number') {
        throw new Error(`${toValueString(value)} is not a number`);
      }
      if (!isFinite(value)) {
        throw new Error(`${toValueString(value)} is not a valid number`);
      }
      return value;
    }

    /**
     * @param {any} value
     */
    function isIntendedLinearGradientValue(value) {
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

  }

}

export const types = Object.freeze(new PropertyTypes());
