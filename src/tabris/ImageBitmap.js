import Blob from './Blob';
import NativeObject from './NativeObject';
import {getBytes, setNativeObject, getNativeObject} from './util';
import ImageData from './ImageData';
import Canvas from './widgets/Canvas';
import {types} from './property-types';

export default class ImageBitmap {

  /**
   * @param {Blob|ImageData|ImageBitmap|Canvas} imageSource
   */
  static createImageBitmap(imageSource) {
    const options = getOptions(arguments);
    if (imageSource instanceof Blob) {
      return load(options, _image => _image.loadEncodedImage(getBytes(imageSource)));
    } else if (imageSource instanceof ImageData) {
      return load(options, _image => _image.loadImageData(imageSource.data, imageSource.width, imageSource.height));
    } else if (imageSource instanceof ImageBitmap) {
      if (getNativeObject(imageSource).isDisposed()) {
        return Promise.reject(new TypeError('Can not create ImageBitmap from another closed ImageBitmap'));
      }
      return load(options, _image => _image.loadImageBitmap(getNativeObject(imageSource).cid));
    } else if (imageSource instanceof Canvas) {
      if (imageSource.isDisposed()) {
        return Promise.reject(new TypeError('Can not create ImageBitmap from a disposed Canvas'));
      }
      return load(options, _image => _image.loadCanvas(imageSource));
    }
    throw new TypeError(
      'Argument 1 of createImageBitmap could not be converted to any of: Blob, ImageData, ImageBitmap, Canvas.'
    );
  }

  /**
   * @param {_ImageBitmap} nativeObject
   * @param {any} resolution
   */
  constructor(nativeObject, resolution) {
    if (!(nativeObject instanceof _ImageBitmap)) {
      throw new TypeError('Illegal constructor');
    }
    setNativeObject(this, nativeObject);
    Object.defineProperty(this, 'width', {value: resolution.width});
    Object.defineProperty(this, 'height', {value: resolution.height});
  }

  close() {
    if (!getNativeObject(this).isDisposed()) {
      getNativeObject(this).dispose();
    }
  }

}

Object.defineProperty(ImageBitmap.prototype, 'width', {value: 0});
Object.defineProperty(ImageBitmap.prototype, 'height', {value: 0});

class _ImageBitmap extends NativeObject {

  get _nativeType() {
    return 'tabris.ImageBitmap';
  }

  /** @param {ArrayBuffer} image */
  loadEncodedImage(image) {
    return new Promise((onSuccess, onError) =>
      this._nativeCall('loadEncodedImage', {image, onSuccess, onError})
    );
  }

  /**
   *  @param {Uint8ClampedArray} imageData
   *  @param {number} width
   *  @param {number} height
   **/
  loadImageData(imageData, width, height) {
    return new Promise((onSuccess, onError) =>
      this._nativeCall('loadImageData', {image: imageData, width, height, onSuccess, onError})
    );
  }

  /** @param {string} imageBitmap */
  loadImageBitmap(imageBitmap) {
    return new Promise((onSuccess, onError) =>
      this._nativeCall('loadImageBitmap', {image: imageBitmap, onSuccess, onError})
    );
  }

  /** @param {Canvas} canvas */
  loadCanvas(canvas) {
    return new Promise((onSuccess, onError) => {
      if (canvas._ctx) {
        canvas._ctx._gc.flush();
      }
      this._nativeCall('loadCanvas', {image: canvas.cid, onSuccess, onError});
    });
  }

}

NativeObject.defineProperties(_ImageBitmap.prototype,  {
  rect: {type: 'any', default: null},
  resizeWidth: {type: 'natural', default: null},
  resizeHeight: {type: 'natural', default: null},
  resizeQuality: {
    type: 'string',
    default: 'low',
    choice: ['pixelated', 'low', 'medium', 'high']
  }
});

/**
 * @param {IArguments} args
 */
function getOptions(args) {
  if ([1, 2, 5, 6].indexOf(args.length) === -1) {
    throw new TypeError(`${args.length} is not a valid argument count for any overload of createImageBitmap.`);
  }
  const options = {};
  if (args.length === 2 && args[1] != null) {
    if (!(args[1] instanceof Object)) {
      throw new TypeError('Argument 2 of createImageBitmap is not an object.');
    }
    Object.assign(options, args[1]);
  } else if (args.length >= 5) {
    if (args.length === 6) {
      if (args[5] != null && !(args[5] instanceof Object)) {
        throw new TypeError('Argument 6 of createImageBitmap is not an object.');
      }
    }
    options.rect = {
      sx: types.natural.convert(args[1]),
      sy: types.natural.convert(args[2]),
      sw: types.natural.convert(args[3]),
      sh: types.natural.convert(args[4])
    };
    Object.assign(options, args[5] || {});
  }
  return options;
}

/**
 * @param {object} options
 * @param {(nativeObject: _ImageBitmap) => Promise<any>} cb
 * @returns {Promise<ImageBitmap>}
 */
function load(options, cb) {
  const nativeObject = new _ImageBitmap(options);
  return cb(nativeObject)
    .then(resolution => {
      const wrapper = new ImageBitmap(nativeObject, resolution);
      Object.defineProperty(wrapper, 'wrapper', {value: wrapper});
      return wrapper;
    })
    .catch(message => {
      nativeObject.dispose();
      throw new Error(message);
    });
}
