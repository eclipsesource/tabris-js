import NativeObject from '../NativeObject';
import Widget from '../Widget';

export default class RadioButton extends Widget {

  get _nativeType() {
    return 'tabris.RadioButton';
  }

}

NativeObject.defineProperties(RadioButton.prototype, {
  text: {type: 'string', default: ''},
  checked: {type: 'boolean', nocache: true},
  textColor: {type: 'color'},
  tintColor: {type: 'color'},
  checkedTintColor: {type: 'color'},
  font: {
    type: 'font',
    set(name, value) {
      this._nativeSet(name, value === undefined ? null : value);
      this._storeProperty(name, value);
    },
    default: null
  }
});

NativeObject.defineEvents(RadioButton.prototype, {
  select: {native: true, changes: 'checked'},
});
