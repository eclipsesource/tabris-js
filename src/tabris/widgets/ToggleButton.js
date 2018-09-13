import NativeObject from '../NativeObject';
import Widget from '../Widget';
import {jsxFactory} from '../JsxProcessor';

export default class ToggleButton extends Widget {

  get _nativeType() {
    return 'tabris.ToggleButton';
  }

  /** @this {import("../JsxProcessor").default} */
  [jsxFactory](Type, props, children) {
    return super[jsxFactory](Type, this.withContentText(props, children, 'text'));
  }

}

NativeObject.defineProperties(ToggleButton.prototype, {
  text: {type: 'string', default: ''},
  image: {type: 'image', default: null},
  checked: {type: 'boolean', nocache: true},
  alignment: {type: ['choice', ['left', 'right', 'center']], default: 'center'},
  textColor: {type: 'color'},
  font: {
    type: 'font',
    set(name, value) {
      this._nativeSet(name, value === undefined ? null : value);
      this._storeProperty(name, value);
    },
    default: null
  },
});

NativeObject.defineEvents(ToggleButton.prototype, {
  select: {native: true, changes: 'checked'},
});
