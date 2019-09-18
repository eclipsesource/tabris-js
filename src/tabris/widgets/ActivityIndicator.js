import Widget from '../Widget';
import NativeObject from '../NativeObject';

export default class ActivityIndicator extends Widget {

  get _nativeType() {
    return 'tabris.ActivityIndicator';
  }

}

NativeObject.defineProperties(ActivityIndicator.prototype, {
  tintColor: {type: 'ColorValue', default: 'initial'}
});
