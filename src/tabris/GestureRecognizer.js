import NativeObject from './NativeObject';
import {types} from './property-types';

export default class GestureRecognizer extends NativeObject {

  get _nativeType() {
    return 'tabris.GestureRecognizer';
  }

  _listen(name, listening) {
    if (name === 'gesture') {
      this._nativeListen(name, listening);
    } else {
      super._listen(name, listening);
    }
  }

}

NativeObject.defineProperties(GestureRecognizer.prototype, {
  type: {type: types.string, default: null},
  target: {type: types.Widget, default: null},
  fingers: {type: types.natural, default: null},
  touches: {type: types.natural, default: null},
  duration: {type: types.natural, default: null},
  direction: {type: types.string, default: null}
});
