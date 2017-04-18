import NativeObject from '../NativeObject';
import Widget from '../Widget';

export default class CheckBox extends Widget {

  get _nativeType() {
    return 'tabris.CheckBox';
  }

  _listen(name, listening) {
    if (name === 'checkedChanged') {
      this._onoff('select', listening, this.$triggerChangeChecked);
    } else if (name === 'select') {
      this._nativeListen(name, listening);
    } else {
      super._listen(name, listening);
    }
  }

  $triggerChangeChecked({checked}) {
    this._triggerChangeEvent('checked', checked);
  }

}

NativeObject.defineProperties(CheckBox.prototype, {
  text: {type: 'string', default: ''},
  checked: {type: 'boolean', nocache: true}
});
