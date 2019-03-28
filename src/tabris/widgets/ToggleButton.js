import NativeObject from '../NativeObject';
import Widget from '../Widget';
import {JSX} from '../JsxProcessor';

export default class ToggleButton extends Widget {

  get _nativeType() {
    return 'tabris.ToggleButton';
  }

  _getXMLAttributes() {
    return super._getXMLAttributes().concat([
      ['text', this.text],
      ['checked', this.checked]
    ]);
  }

  /** @this {import("../JsxProcessor").default} */
  [JSX.jsxFactory](Type, attributes) {
    const children = this.getChildren(attributes);
    const normalAttributes = this.withoutChildren(attributes);
    return super[JSX.jsxFactory](Type, this.withContentText(
      normalAttributes,
      children,
      'text'
    ));
  }

}

NativeObject.defineProperties(ToggleButton.prototype, {
  text: {type: 'string', default: ''},
  image: {type: 'ImageValue', default: null},
  checked: {type: 'boolean', nocache: true},
  alignment: {type: ['choice', ['left', 'right', 'center']], default: 'center'},
  textColor: {type: 'ColorValue'},
  font: {
    type: 'FontValue',
    set(name, value) {
      this._nativeSet(name, value);
      this._storeProperty(name, value);
    },
    default: null
  },
});

NativeObject.defineEvents(ToggleButton.prototype, {
  select: {native: true, changes: 'checked'},
});
