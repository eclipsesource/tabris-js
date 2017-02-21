import NativeObject from '../NativeObject';
import Widget from '../Widget';

export default class ToggleButton extends Widget {

  constructor(properties) {
    super();
    this._create('tabris.ToggleButton', properties);
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

NativeObject.defineProperties(ToggleButton.prototype, {
  text: {type: 'string', default: ''},
  image: {type: 'image', default: null},
  selection: {type: 'boolean', nocache: true},
  alignment: {type: ['choice', ['left', 'right', 'center']], default: 'center'}
});
