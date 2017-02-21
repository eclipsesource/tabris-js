import NativeObject from '../NativeObject';
import Widget from '../Widget';

export default class CheckBox extends Widget {

  constructor(properties) {
    super();
    this._create('tabris.CheckBox', properties);
  }

  _listen(name, listening) {
    if (name === 'change:selection') {
      this._onoff('select', listening, this.$triggerChangeSelection);
    } else if (name === 'select') {
      this._nativeListen(name, listening);
    } else {
      super._listen(name, listening);
    }
  }

  $triggerChangeSelection({selection}) {
    this._triggerChangeEvent('selection', selection);
  }

}

NativeObject.defineProperties(CheckBox.prototype, {
  text: {type: 'string', default: ''},
  selection: {type: 'boolean', nocache: true}
});
