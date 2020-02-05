import NativeObject from '../NativeObject';
import Widget from '../Widget';
import {JSX} from '../JsxProcessor';
import {types} from '../property-types';

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
  text: {type: types.string, default: ''},
  image: {type: types.ImageValue, default: null},
  checked: {type: types.boolean, nocache: true},
  alignment: {
    type: types.string,
    choice: ['left', 'right', 'centerX'],
    default: 'centerX'
  },
  textColor: {type: types.ColorValue, default: 'initial'},
  font: {type: types.FontValue, default: 'initial'}
});

NativeObject.defineEvents(ToggleButton.prototype, {
  select: {native: true, changes: 'checked'}
});
