import NativeObject from '../NativeObject';
import Widget from '../Widget';

export default class CheckBox extends Widget {

  get _nativeType() {
    return 'tabris.CheckBox';
  }

}

NativeObject.defineProperties(CheckBox.prototype, {
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

NativeObject.defineEvents(CheckBox.prototype, {
  select: {native: true, changes: 'checked'},
});
