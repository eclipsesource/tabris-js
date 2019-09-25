import NativeObject from '../NativeObject';
import Widget from '../Widget';
import Camera from '../Camera';

export default class CameraView extends Widget {

  get _nativeType() {
    return 'tabris.CameraView';
  }

}

NativeObject.defineProperties(CameraView.prototype, {
  camera: {type: Camera, default: null, nullable: true},
  scaleMode: {
    type: 'string',
    choice: ['fit', 'fill'],
    default: 'fit'
  }
});
