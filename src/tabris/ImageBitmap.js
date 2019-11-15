import Blob from './Blob';
import NativeObject from './NativeObject';
import {getBytes, setNativeObject, getNativeObject} from './util';
import ImageData from './ImageData';
import Canvas from './widgets/Canvas';

export default class ImageBitmap {

  /**
   * @param {Blob|ImageData|ImageBitmap|Canvas} imageSource
   */
  static createImageBitmap(imageSource) {
    if (arguments.length !== 1) {
      return Promise.reject(new TypeError(
        `${arguments.length} is not a valid argument count for any overload of createImageBitmap.`
      ));
    }
    if (imageSource instanceof Blob) {
      return load(_image => _image.loadEncodedImage(getBytes(imageSource)));
    } else if (imageSource instanceof ImageData) {
      return load(_image => _image.loadImageData(imageSource.data, imageSource.width, imageSource.height));
    } else if (imageSource instanceof ImageBitmap) {
      if (getNativeObject(imageSource).isDisposed()) {
        return Promise.reject(new TypeError('Can not create ImageBitmap from another closed ImageBitmap'));
      }
      return load(_image => _image.loadImageBitmap(getNativeObject(imageSource).cid));
    } else if (imageSource instanceof Canvas) {
      if (imageSource.isDisposed()) {
        return Promise.reject(new TypeError('Can not create ImageBitmap from a disposed Canvas'));
      }
      return load(_image => _image.loadCanvas(imageSource));
    }
    return Promise.reject(new TypeError(
      'Argument 1 of createImageBitmap could not be converted to any of: Blob, ImageData, ImageBitmap, Canvas.'
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

Object.defineProperty(_ImageBitmap.prototype, 'wrapper', {
  value: /** @type {ImageBitmap} */(null)}
);

/**
 * @param {(nativeObject: _ImageBitmap) => Promise<any>} cb
 * @returns {Promise<ImageBitmap>}
 */
function load(cb) {
  const nativeObject = new _ImageBitmap();
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
