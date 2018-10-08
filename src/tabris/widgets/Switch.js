import NativeObject from '../NativeObject';
import Widget from '../Widget';

export default class Switch extends Widget {

  get _nativeType() {
    return 'tabris.Switch';
  }

}

NativeObject.defineProperties(Switch.prototype, {
  checked: {type: 'boolean', nocache: true},
  thumbOnColor: {type: 'ColorValue'},
  thumbOffColor: {type: 'ColorValue'},
  trackOnColor: {type: 'ColorValue'},
  trackOffColor: {type: 'ColorValue'}
});

NativeObject.defineEvents(Switch.prototype, {
  select: {native: true, changes: 'checked'},
});
