import NativeObject from '../NativeObject';
import Widget from '../Widget';
import {JSX} from '../JsxProcessor';
import {types} from '../property-types';

export default class TextView extends Widget {

  get _nativeType() {
    return 'tabris.TextView';
  }

  _getXMLContent() {
    let content = super._getXMLContent();
    if (this._shouldPrintTextAsXMLContent()) {
      content = content.concat(this.text.split('\n').map(line => '  ' + line));
    }
    return content;
  }

  _getXMLAttributes() {
    const result = super._getXMLAttributes();
    if (this.markupEnabled) {
      result.push(['markupEnabled', 'true']);
    }
    if (!this._shouldPrintTextAsXMLContent()) {
      result.push(['text', this.text]);
    }
    return result;
  }

  _shouldPrintTextAsXMLContent() {
    return this.markupEnabled || this.text.length > 25 || this.text.indexOf('\n') !== -1;
  }

  _listen(name, listening) {
    if (name === 'tapLink') {
      this._nativeListen(name, listening);
    } else {
      super._listen(name, listening);
    }
  }

  /** @this {import("../JsxProcessor").default} */
  [JSX.jsxFactory](Type, attributes) {
    const children = this.getChildren(attributes);
    const normalAttributes = this.withoutChildren(attributes);
    return super[JSX.jsxFactory](Type, this.withContentText(
      normalAttributes,
      children,
      'text',
      attributes ? attributes.markupEnabled : false
    ));
  }

}

NativeObject.defineProperties(TextView.prototype, {
  alignment: {
    type: types.string,
    choice: ['left', 'right', 'centerX'],
    default: 'left'
  },
  markupEnabled: {type: types.boolean, default: false},
  lineSpacing: {type: types.number, default: 1},
  selectable: {type: types.boolean, default: false},
  maxLines: {
    type: {
      convert: value => value <= 0 ? null : types.natural.convert(value)},
    default: null,
    nullable: true
  },
  text: {type: types.string, default: ''},
  textColor: {type: types.ColorValue, default: 'initial'},
  font: {type: types.FontValue, default: 'initial'}
});

NativeObject.defineEvents(TextView.prototype, {
  tapLink: {native: true}
});
