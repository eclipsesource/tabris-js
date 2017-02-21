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
    } else if (name === 'change:selection') {
      this._onoff('select', listening, this.$triggerChangeSelection);
    } else {
      super._listen(name, listening);
    }
  }

  $triggerChangeSelection({selection}) {
    this._triggerChangeEvent('selection', selection);
  }

}

NativeObject.defineProperties(RadioButton.prototype, {
  text: {type: 'string', default: ''},
  selection: {type: 'boolean', nocache: true}
});
