import NativeObject from '../NativeObject';
import Widget from '../Widget';

export default class CheckBox extends Widget {

  constructor(properties) {
    super();
    this._create('tabris.CheckBox', properties);
  }

  _listen(name, listening) {
    if (name === 'change:checked') {
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
