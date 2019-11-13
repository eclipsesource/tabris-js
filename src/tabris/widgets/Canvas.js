import CanvasContext from '../CanvasContext';
import Composite from './Composite';
import {createNativeCallback, setBytes} from '../util';
import Blob from '../Blob';

const MIME_TYPES = Object.freeze({
  'image/png': 'image/png',
  'image/jpeg': 'image/jpeg',
  'image/webp': 'image/webp'
});

const TYPE_QUALITY = Object.freeze({
  'image/png': 1,
  'image/jpeg': 0.92,
  'image/webp': 0.8
});

export default class Canvas extends Composite {

  get _nativeType() {
    return 'tabris.Canvas';
  }

  getContext(type, width, height) {
    if (type === '2d') {
      return CanvasContext.getContext(this, width, height);
    }
    return null;
  }

  /**
   * @param {unknown=} callback
   * @param {unknown=} mimeType
   * @param {unknown=} quality
   */
  toBlob(callback, mimeType, quality) {
    if (arguments.length === 0) {
      throw new TypeError('Canvas.toBlob requires at least 1 argument, but only 0 were passed');
    }
    if (!(callback instanceof Function)) {
      throw new TypeError('Argument 1 of Canvas.toBlob is not a function');
    }
    const isValidQuality
      = typeof quality === 'number' && !isNaN(quality) && quality >= 0 && quality <= 1;
    const validType
      = MIME_TYPES[typeof mimeType === 'string' ? mimeType : ''] || MIME_TYPES['image/png'];
    this._nativeCall('toBlob', {
      onSuccess: createNativeCallback((buffer, resultType) => {
        if (!buffer) {
          callback(null);
        } else {
          const blob = new Blob([], {type: resultType});
          setBytes(blob, buffer);
          callback(blob);
        }
      }),
      mimeType: validType,
      quality: isValidQuality ? quality : TYPE_QUALITY[validType]
    });
  }

}
