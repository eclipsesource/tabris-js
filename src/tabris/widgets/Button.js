import NativeObject from '../NativeObject';
import Widget from '../Widget';
import {types} from '../property-types';
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
    type: types.string,
    choice: ['default', 'elevate', 'flat', 'outline', 'text'],
    default: 'default',
    const: true
  },
  strokeColor: {
    type: {
      convert(value, button) {
        if (button.style !== 'outline') {
          throw new Error(
            `The strokeColor can only be set on buttons with style "outline" but it has style ${button.style}.`
          );
        }
        return types.ColorValue.convert(value);
      },
      encode: types.ColorValue.encode,
    },
    default: 'initial'
  },
  strokeWidth: {
    type: {
      convert(value, button) {
        if (button.style !== 'outline') {
          throw new Error(
            `The strokeWidth can only be set on buttons with style "outline" but it has style ${button.style}.`
          );
        }
        return types.dimension.convert(value);
      }
    },
    nullable: true,
    default: null
  },
  alignment: {
    type: types.string,
    choice: ['left', 'right', 'centerX'],
    default: 'centerX'
  },
  autoCapitalize: {
    type: types.string,
    choice: ['default', 'none', 'all'],
    default: 'default'
  },
  image: {type: types.ImageValue, default: null},
  imageTintColor: {type: types.ColorValue, default: 'initial'},
  text: {type: types.string, default: ''},
  textColor: {type: types.ColorValue, default: 'initial'},
  font: {type: types.FontValue, default: 'initial'}
});

NativeObject.defineEvents(Button.prototype, {
  select: {native: true},
});
