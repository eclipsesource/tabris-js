import {normalizePathUrl, checkNumber} from './util';
import {hint, toValueString} from './Console';

export default class Image {

  static isImageValue(value) {
    return value == null || value === 'initial' || Image.isValidImageValue(value);
  }

  static isValidImageValue(value) {
    try {
      Image.from(value);
      return true;
    } catch(ex) {
      return false;
    }
  }

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

  constructor(imageLike) {
    if (arguments.length < 1) {
      throw new Error('Not enough arguments');
    }
    checkConsistentDimensions(imageLike);
    setSrc(this, imageLike);
    ['width', 'height'].forEach(property => {
      setDimension(this, property, property in imageLike ? imageLike[property] : 'auto');
    });
    setScale(this, imageLike);
  }
}

function setScale(image, imageLike) {
  let scale = 'scale' in imageLike ? imageLike.scale : 'auto';
  if (!('scale' in imageLike)) {
    if (!hasExplicit(imageLike, 'width') && !hasExplicit(imageLike, 'height')) {
      const autoScaleMatch = /@([0-9]\.?[0-9]*)x/.exec(imageLike.src.split('/').pop());
      if (autoScaleMatch && autoScaleMatch[1]) {
        scale = parseFloat(autoScaleMatch[1], 10);
      }
    }
  }
  setDimension(image, 'scale', scale);
}

function hasExplicit(imageLike, property) {
  return property in imageLike && imageLike[property] !== 'auto';
}

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

function checkConsistentDimensions(imageLike) {
  if (hasInconsistentDimensions(imageLike)) {
    throw new Error('Image "scale" cannot be used with "width" and "height"');
  }
}

function hasInconsistentDimensions(imageLike) {
  return hasExplicit(imageLike, 'scale') && (hasExplicit(imageLike, 'width') || hasExplicit(imageLike, 'height'));
}

function setDimension(image, property, value) {
  if (value !== 'auto') {
    checkNumber(value, [0, Infinity], `Image "${property}" is not a dimension`);
  }
  Object.defineProperty(image, property, {enumerable: true, value});
}
