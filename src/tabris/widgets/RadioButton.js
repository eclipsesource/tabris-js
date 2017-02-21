import NativeObject from '../NativeObject';
import Widget from '../Widget';

export default class RadioButton extends Widget {

  constructor(properties) {
    super();
    this._create('tabris.RadioButton', properties);
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

NativeObject.defineProperties(RadioButton.prototype, {
  text: {type: 'string', default: ''},
  checked: {type: 'boolean', nocache: true}
});
