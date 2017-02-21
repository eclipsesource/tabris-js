import NativeObject from '../NativeObject';
import Widget from '../Widget';

export default class Switch extends Widget {

  constructor(properties) {
    super();
    this._create('tabris.Switch', properties);
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

NativeObject.defineProperties(Switch.prototype, {
  selection: {type: 'boolean', nocache: true},
  thumbOnColor: {type: 'color'},
  thumbOffColor: {type: 'color'},
  trackOnColor: {type: 'color'},
  trackOffColor: {type: 'color'}
});
