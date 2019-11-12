import {normalizePathUrl, checkNumber, getNativeObject, getBytes} from './util';
import {hint, toValueString} from './Console';
import * as symbols from './symbols';

export default class Image {

  /**
   * @param {any} value
   */
  static isImageValue(value) {
    return value == null || value === 'initial' || Image.isValidImageValue(value);
  }

  /**
   * @param {any} value
   */
  static isValidImageValue(value) {
    try {
      Image.from(value);
      return true;
    } catch(ex) {
      return false;
    }
  }

  /**
   * @param {any} value
   */
  static from(value) {
    if (value instanceof Image) {
      if (getNativeObject(value.src) && getNativeObject(value.src).isDisposed()) {
        throw new Error('ImageBitmap is closed');
      }
      return value;
    }
    if (typeof value === 'string' || getNativeObject(value) || getBytes(value)) {
      return new Image({src: value});
    }
    if (value instanceof Object) {
      if (hasInconsistentDimensions(value)) {
        hint(
          this === Image ? 'Image.from' : this,
          'image "scale" is ignored when "width" and/or "height" are set to a number'
        );
        return new Image(Object.assign({}, value, {scale: 'auto'}));
      }
      return new Image(value);
    }
    throw new Error(`${toValueString(value)} is not a valid ImageValue`);
  }

  /**
   * @param {ImageLikeObject} imageLike
   */
  constructor(imageLike) {
    if (arguments.length < 1) {
      throw new Error('Not enough arguments');
    }
    checkConsistentDimensions(imageLike);
    setSrc(this, imageLike);
    setDimension(this, 'width', hasExplicit(imageLike, 'width') ? imageLike.width : 'auto');
    setDimension(this, 'height', hasExplicit(imageLike, 'height') ? imageLike.height : 'auto');
    setScale(this, imageLike);
  }

  equals(value) {
    if (!(value instanceof Image)) {
      return false;
    }
    return value.src === this.src
      && value.scale === this.scale
      && value.width === this.width
      && value.height === this.height;
  }

}

Image.prototype[symbols.equals] = Image.prototype.equals;

/** @type {number|Auto} */
const initDimension = 0;
/** @type {string|object} */
const initSrc = '';
Object.defineProperty(Image.prototype, 'src', {value: initSrc});
Object.defineProperty(Image.prototype, 'width', {value: initDimension});
Object.defineProperty(Image.prototype, 'height', {value: initDimension});
Object.defineProperty(Image.prototype, 'scale', {value: initDimension});

/**
 * @param {Image} image
 * @param {ImageLikeObject} imageLike
 */

function setScale(image, imageLike) {
  let scale = hasExplicit(imageLike, 'scale') ? imageLike.scale : 'auto';
  if (
    imageLike.scale == null
    && !hasExplicit(imageLike, 'width')
    && !hasExplicit(imageLike, 'height')
    && typeof imageLike.src === 'string'
  ) {
    const autoScaleMatch = /@([0-9]\.?[0-9]*)x/.exec(imageLike.src.split('/').pop());
    if (autoScaleMatch && autoScaleMatch[1]) {
      scale = parseFloat(autoScaleMatch[1]);
    }
  }
  setDimension(image, 'scale', scale);
}

/**
 * @param {ImageLikeObject} imageLike
 * @param {keyof ImageLikeObject} property
 */
function hasExplicit(imageLike, property) {
  return property in imageLike && imageLike[property] !== 'auto' && imageLike[property] != null;
}

/**
 * @param {Image} image
 * @param {ImageLikeObject} imageLike
 */
function setSrc(image, imageLike) {
  checkSrc(imageLike);
  if (getNativeObject(imageLike.src) || getBytes(imageLike.src)) {
    Object.defineProperty(image, 'src', {enumerable: true, value: imageLike.src});
  } else {
    let path;
    try {
      path = normalizePathUrl(imageLike.src);
    } catch (err) {
      throw new Error('Invalid image "src": ' + err.message);
    }
    Object.defineProperty(image, 'src', {enumerable: true, value: path});
  }
}

/**
 * @param {ImageLikeObject} imageLike
 */
function checkSrc(imageLike) {
  if (!('src' in imageLike)) {
    throw new Error('Image "src" missing');
  }
  if (getNativeObject(imageLike.src)) {
    if (getNativeObject(imageLike.src).isDisposed()) {
      throw new Error('ImageBitmap is closed');
    }
  } else if (typeof imageLike.src === 'string') {
    if (!imageLike.src.length) {
      throw new Error('Image "src" must not be empty');
    }
  } else if (getBytes(imageLike.src)) {
    if (!imageLike.src.size) {
      throw new Error('Image "src" must not be empty');
    }
  } else {
    throw new Error(`Image "src" ${toValueString(imageLike.src)} must be a string, ImageBitmap or Blob`);
  }
}

/**
 * @param {ImageLikeObject} imageLike
 */
function checkConsistentDimensions(imageLike) {
  if (hasInconsistentDimensions(imageLike)) {
    throw new Error('Image "scale" cannot be used with "width" and "height"');
  }
}

/**
 * @param {ImageLikeObject} imageLike
 */
function hasInconsistentDimensions(imageLike) {
  return hasExplicit(imageLike, 'scale') && (hasExplicit(imageLike, 'width') || hasExplicit(imageLike, 'height'));
}

/**
 * @param {Image} image
 * @param {keyof Image} property
 * @param {number|'auto'} value
 */
function setDimension(image, property, value) {
  if (value !== 'auto') {
    checkNumber(value, [0, Infinity], `Image "${property}" is not a dimension`);
  }
  Object.defineProperty(image, property, {enumerable: true, value});
}
