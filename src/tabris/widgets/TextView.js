import NativeObject from '../NativeObject';
import Widget from '../Widget';
import {jsxFactory} from '../JsxProcessor';

export default class TextView extends Widget {

  get _nativeType() {
    return 'tabris.TextView';
  }

  _listen(name, listening) {
    if (name === 'tapLink') {
      this._nativeListen(name, listening);
    } else {
      super._listen(name, listening);
    }
  }

  /** @this {import("../JsxProcessor").default} */
  [jsxFactory](Type, props, children) {
    return super[jsxFactory](Type, this.withContentText(props, children, 'text'));
  }

}

NativeObject.defineProperties(TextView.prototype, {
  alignment: {type: ['choice', ['left', 'right', 'center']], default: 'left'},
  markupEnabled: {type: 'boolean', default: false, const: true}, // TODO: readonly
  lineSpacing: {type: 'number', default: 1},
  selectable: {type: 'boolean', default: false},
  maxLines: {
    type: ['nullable', 'natural'],
    default: null,
    set(name, value) {
      this._nativeSet(name, value <= 0 ? null : value);
      this._storeProperty(name, value);
    }
  },
  text: {type: 'string', default: ''},
  textColor: {type: 'ColorValue'},
  font: {
    type: 'font',
    set(name, value) {
      this._nativeSet(name, value === undefined ? null : value);
      this._storeProperty(name, value);
    },
    default: null
  }
});
