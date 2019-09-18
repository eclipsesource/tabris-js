import {normalizePathUrl, checkNumber} from './util';
import {hint, toValueString} from './Console';

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
      return value;
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
    if (typeof value === 'string') {
      return new Image({src: value});
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
    setDimension(this, 'width', 'width' in imageLike ? imageLike.width : 'auto');
    setDimension(this, 'height', 'height' in imageLike ? imageLike.height : 'auto');
    setScale(this, imageLike);
  }

}

/** @type {number|Auto} */
const initDimension = 0;
Object.defineProperty(Image.prototype, 'src', {value: ''});
Object.defineProperty(Image.prototype, 'width', {value: initDimension});
Object.defineProperty(Image.prototype, 'height', {value: initDimension});
Object.defineProperty(Image.prototype, 'scale', {value: initDimension});

/**
 * @param {Image} image
 * @param {ImageLikeObject} imageLike
 */
function setScale(image, imageLike) {
  let scale = 'scale' in imageLike ? imageLike.scale : 'auto';
  if (!('scale' in imageLike)) {
    if (!hasExplicit(imageLike, 'width') && !hasExplicit(imageLike, 'height')) {
      const autoScaleMatch = /@([0-9]\.?[0-9]*)x/.exec(imageLike.src.split('/').pop());
      if (autoScaleMatch && autoScaleMatch[1]) {
        scale = parseFloat(autoScaleMatch[1]);
      }
    }
  }
  setDimension(image, 'scale', scale);
}

/**
 * @param {ImageLikeObject} imageLike
 * @param {keyof ImageLikeObject} property
 */
function hasExplicit(imageLike, property) {
  return property in imageLike && imageLike[property] !== 'auto';
}

/**
 * @param {Image} image
 * @param {ImageLikeObject} imageLike
 */
function setSrc(image, imageLike) {
  checkSrc(imageLike);
  let path;
  try {
    path = normalizePathUrl(imageLike.src);
  } catch (err) {
    throw new Error('Invalid image "src": ' + err.message);
  }
  Object.defineProperty(image, 'src', {enumerable: true, value: path});
}

/**
 * @param {ImageLikeObject} imageLike
 */
function checkSrc(imageLike) {
  if (!('src' in imageLike)) {
    throw new Error('Image "src" missing');
  }
  if (typeof imageLike.src !== 'string') {
    throw new Error(`Image "src" ${toValueString(imageLike.src)} must be a string`);
  }
  if (!imageLike.src.length) {
    throw new Error('Image "src" must not be empty');
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
