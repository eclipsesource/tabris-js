import Blob from './Blob';
import NativeObject from './NativeObject';
import {getBytes} from './util';

export default class ImageBitmap {

  /**
   * @param {Blob} image
   */
  static createImageBitmap(image) {
    if (arguments.length !== 1) {
      return Promise.reject(new TypeError(
        `${arguments.length} is not a valid argument count for any overload of createImageBitmap.`
      ));
    }
    if (image instanceof Blob) {
      return load(_image => _image.loadEncodedImage(getBytes(image)));
    }
    return Promise.reject(new TypeError(
      'Argument 1 of createImageBitmap could not be converted to any of: Blob.'
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

  constructor() {
    super();
    this._create(this._nativeType);
  }

  get _nativeType() {
    return 'tabris.ImageBitmap';
  }

  /** @param {ArrayBuffer} image */
  loadEncodedImage(image) {
    return new Promise((onSuccess, onError) =>
      this._nativeCall('loadEncodedImage', {image, onSuccess, onError})
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
