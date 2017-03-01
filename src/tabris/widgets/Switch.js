import NativeObject from '../NativeObject';
import Widget from '../Widget';

export default class Switch extends Widget {

  get _nativeType() {
    return 'tabris.Switch';
  }

  _listen(name, listening) {
    if (name === 'select') {
      this._nativeListen(name, listening);
    } else if (name === 'change:checked') {
      this._onoff('select', listening, this.$triggerChangeChecked);
    } else {
      super._listen(name, listening);
    }
  }

  $triggerChangeChecked({checked}) {
    this._triggerChangeEvent('checked', checked);
  }

}

NativeObject.defineProperties(Switch.prototype, {
  checked: {type: 'boolean', nocache: true},
  thumbOnColor: {type: 'color'},
  thumbOffColor: {type: 'color'},
  trackOnColor: {type: 'color'},
  trackOffColor: {type: 'color'}
});
