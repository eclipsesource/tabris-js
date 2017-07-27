import Widget from '../Widget';
import NativeObject from '../NativeObject';

export default class Composite extends Widget {

  get _nativeType() {
    return 'tabris.Composite';
  }

  _acceptChild() {
    return true;
  }

}

NativeObject.defineProperties(Composite.prototype, {
  padding: {
    type: 'boxDimensions',
    default: {left: 0, right: 0, top: 0, bottom: 0}
  }
});
