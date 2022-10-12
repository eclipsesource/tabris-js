import Blob from './Blob';
import NativeObject from './NativeObject';
import {setBytes, allowOnlyKeys} from './util';
import {types} from './property-types';

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
          onError: (error) => reject(new Error(error))
        });
      }
    });
  }

}

NativeObject.defineProperties(Camera.prototype, {
  cameraId: {type: types.string, const: true, default: ''},
  active: {type: types.boolean, default: false},
  captureResolution: {
    type: {
      convert(value) {
        return Object.freeze(allowOnlyKeys(
          (/** @type {{width: number, height: number}} */ (value)),
          ['width', 'height'])
        );
      }
    },
    default: null,
    nullable: true
  },
  position: {type: types.string, const: true, readonly: true},
  availableCaptureResolutions: {
    type: {
      decode(value) {
        return value.sort((a, b) => a.width * a.height - b.width * b.height);
      }
    },
    const: true,
    readonly: true
  },
  priority: {
    choice: ['balanced', 'performance', 'quality'],
    default: 'balanced'
  }
});
