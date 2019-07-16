import Blob from './Blob';
import NativeObject from './NativeObject';
import {getBytes} from './util';
import ImageData from './ImageData';

export default class ImageBitmap {

  /**
   * @param {Blob|ImageData|ImageBitmap} image
   */
  static createImageBitmap(image) {
    if (arguments.length !== 1) {
      return Promise.reject(new TypeError(
        `${arguments.length} is not a valid argument count for any overload of createImageBitmap.`
      ));
    }
    if (image instanceof Blob) {
      return load(_image => _image.loadEncodedImage(getBytes(image)));
    } else if (image instanceof ImageData) {
      return load(_image => _image.loadImageData(image.data, image.width, image.height));
    } else if (image instanceof ImageBitmap) {
      if (getNativeObject(image).isDisposed()) {
        return Promise.reject(new TypeError('Can not create ImageBitmap from another closed ImageBitmap'));
      }
      return load(_image => _image.loadImageBitmap(getNativeObject(image).cid));
    }
    return Promise.reject(new TypeError(
      'Argument 1 of createImageBitmap could not be converted to any of: Blob, ImageData, ImageBitmap.'
    ));
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
   *  @param {Uint8ClampedArray} image
   *  @param {number} width
   *  @param {number} height
   **/
  loadImageData(image, width, height) {
    return new Promise((onSuccess, onError) =>
      this._nativeCall('loadImageData', {image, width, height, onSuccess, onError})
    );
  }

  /** @param {string} image */
  loadImageBitmap(image) {
    return new Promise((onSuccess, onError) =>
      this._nativeCall('loadImageBitmap', {image, onSuccess, onError})
    );
  }

}
/**
 * @param {(nativeObject: _ImageBitmap) => Promise<any>} cb
 * @returns {Promise<ImageBitmap>}
 */
function load(cb) {
  const nativeObject = new _ImageBitmap();
  return cb(nativeObject)
    .then(resolution => new ImageBitmap(nativeObject, resolution))
    .catch(message => {
      nativeObject.dispose();
      throw new Error(message);
    });
}

const nativeObjectKey = Symbol();

/**
 * @param {ImageBitmap} imageBitmap
 * @returns {_ImageBitmap}
 */
export function getNativeObject(imageBitmap) {
  return imageBitmap[nativeObjectKey];
}

/**
 * @param {ImageBitmap} imageBitmap
 * @param {_ImageBitmap} nativeObject
 */
function setNativeObject(imageBitmap, nativeObject) {
  imageBitmap[nativeObjectKey] = nativeObject;
}
