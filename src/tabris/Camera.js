import Blob from './Blob';
import NativeObject from './NativeObject';
import {setBytes} from './util';

export default class Camera extends NativeObject {

  constructor(properties) {
    if (!properties || !properties.cameraId) {
      throw new Error('Camera requires cameraId');
    }
    super(properties);
  }

  get _nativeType() {
    return 'tabris.Camera';
  }

  captureImage(options = {}) {
    return new Promise((resolve, reject) => {
      if (!this.active) {
        reject(new Error('Camera has to be active to capture an image'));
      } else {
        this._nativeCall('captureImage', {
          options,
          onResult: (result) => {
            const blob = new Blob([], {type: 'image/jpg'});
            setBytes(blob, result.image);
            return resolve({
              image: blob,
              width: result.width,
              height: result.height
            });
          },
          onError: (error) => reject(new Error(error)),
        });
      }
    });
  }

}

NativeObject.defineProperties(Camera.prototype, {
  cameraId: {type: 'string', const: true},
  active: {type: 'boolean'},
  captureResolution: {type: 'any'},
  position: {type: 'string', const: true, readonly: true},
  availableCaptureResolutions: {
    type: 'any',
    get(name) {
      return this._nativeGet(name).sort((a, b) => a.width * a.height - b.width * b.height);
    }
  }
});
