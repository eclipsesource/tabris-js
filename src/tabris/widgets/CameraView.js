import NativeObject from '../NativeObject';
import Widget from '../Widget';

export default class CameraView extends Widget {

  get _nativeType() {
    return 'tabris.CameraView';
  }

}

NativeObject.defineProperties(CameraView.prototype, {
  camera: {type: 'NativeObject'},
  scaleMode: {type: ['choice', ['fit', 'fill']], default: 'fit'}
});
