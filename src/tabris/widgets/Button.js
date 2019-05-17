import NativeObject from '../NativeObject';
import Widget from '../Widget';
import {hint} from '../Console';
import {JSX} from '../JsxProcessor';

export default class Button extends Widget {

  /**
   * @param {Partial<Button>=} properties
   */
  constructor(properties) {
    super(Object.assign({style: 'default'}, properties));
  }

  get _nativeType() {
    return 'tabris.Button';
  }

  /**
   * @param {string[]} properties
   */
  _reorderProperties(properties) {
    const styleIndex = properties.indexOf('style');
    if (styleIndex === -1) {
      return super._reorderProperties(properties);
    }
    return super._reorderProperties(
      ['style']
        .concat(properties.slice(0, styleIndex))
        .concat(properties.slice(styleIndex + 1))
    );
  }

  _getXMLAttributes() {
    return super._getXMLAttributes().concat([['text', this.text]]);
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

NativeObject.defineProperties(Button.prototype, {
  style: {
    type: ['choice', ['default', 'elevate', 'flat', 'outline', 'text']],
    const: true
  },
  strokeColor: {
    type: 'ColorValue',
    set(name, value) {
      if (this.style === 'outline') {
        this._nativeSet(name, value);
        this._storeProperty(name, value);
      } else {
        hint(this, `The strokeColor can only be set on buttons with style "outline" but it has style ${this.style}.`);
      }
    }
  },
  strokeWidth: {
    type: 'number', nocache: true,
    set(name, value) {
      if (this.style === 'outline') {
        this._nativeSet(name, value);
        this._storeProperty(name, value);
      } else {
        hint(this, `The strokeWidth can only be set on buttons with style "outline" but it has style ${this.style}.`);
      }
    }
  },
  alignment: {type: ['choice', ['left', 'right', 'centerX']], default: 'centerX'},
  image: {type: 'ImageValue', default: null},
  text: {type: 'string', default: ''},
  textColor: {type: 'ColorValue'},
  font: {
    type: 'FontValue',
    set(name, value) {
      this._nativeSet(name, value);
      this._storeProperty(name, value);
    },
    default: null
  }
});

NativeObject.defineEvents(Button.prototype, {
  select: {native: true},
});
