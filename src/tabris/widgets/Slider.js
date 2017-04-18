import NativeObject from '../NativeObject';
import Widget from '../Widget';

export default class Slider extends Widget {

  get _nativeType() {
    return 'tabris.Slider';
  }

  _listen(name, listening) {
    if (name === 'select') {
      this._nativeListen(name, listening);
    } else if (name === 'selectionChanged') {
      this._onoff('select', listening, this.$triggerChangeSelection);
    } else {
      super._listen(name, listening);
    }
  }

  $triggerChangeSelection({selection}) {
    this._triggerChangeEvent('selection', selection);
  }

}

NativeObject.defineProperties(Slider.prototype, {
  minimum: {type: 'integer', default: 0},
  maximum: {type: 'integer', default: 100},
  selection: {type: 'integer', nocache: true}
});
