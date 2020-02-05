import NativeObject from '../NativeObject';
import Widget from '../Widget';
import {JSX} from '../JsxProcessor';

export default class RadioButton extends Widget {

  get _nativeType() {
    return 'tabris.RadioButton';
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

NativeObject.defineProperties(RadioButton.prototype, {
  text: {type: 'string', default: ''},
  checked: {type: 'boolean', nocache: true},
  textColor: {type: 'ColorValue', default: 'initial'},
  tintColor: {type: 'ColorValue', default: 'initial'},
  checkedTintColor: {type: 'ColorValue', default: 'initial'},
  font: {type: 'FontValue', default: 'initial'}
});

NativeObject.defineEvents(RadioButton.prototype, {
  select: {native: true, changes: 'checked'}
});
