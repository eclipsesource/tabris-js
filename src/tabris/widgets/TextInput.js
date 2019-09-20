import NativeObject from '../NativeObject';
import Widget from '../Widget';
import {JSX} from '../JsxProcessor';
import {toValueString} from '../Console';
import {types} from '../property-types';

export default class TextInput extends Widget {

  get _nativeType() {
    return 'tabris.TextInput';
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
    if (this.type !== 'default') {
      result.push(['type', this.type]);
    }
    if (!this._shouldPrintTextAsXMLContent()) {
      result.push(['text', this.text]);
    }
    if (this.message) {
      result.push(['message', this.message]);
    }
    if (!this.editable) {
      result.push(['editable', 'false']);
    }
    if (this.focused) {
      result.push(['focused', 'true']);
    }
    if (this.keepFocus) {
      result.push(['keepFocus', 'true']);
    }
    return result;
  }

  _shouldPrintTextAsXMLContent() {
    return this.text.length > 25 || this.text.indexOf('\n') !== -1;
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

NativeObject.defineProperties(TextInput.prototype, {
  type: {
    type: types.string,
    choice: ['default', 'password', 'search', 'multiline'],
    const: true,
    default: 'default'
  },
  style: {
    type: types.string,
    choice: ['default', 'outline', 'fill', 'underline', 'none'],
    const: true,
    default: 'default'
  },
  text: {type: types.string, nocache: true},
  message: {type: types.string, default: ''},
  floatMessage: {type: types.boolean, default: true},
  editable: {type: types.boolean, default: true},
  maxChars: {
    type: {
      convert: value => value <= 0 ? null : types.natural.convert(value)},
    default: null,
    nullable: true
  },
  keepFocus: {type: types.boolean, default: false},
  alignment: {
    type: types.string,
    choice: ['left', 'centerX', 'right'],
    default: 'left'
  },
  autoCorrect: {type: types.boolean, default: false},
  autoCapitalize: {
    type: {convert: v => v === true ? 'all' : v || 'none'},
    choice: ['none', 'sentence', 'word', 'all'],
    default: false
  },
  keyboard: {
    type: types.string,
    choice: ['ascii', 'decimal', 'email', 'number', 'numbersAndPunctuation', 'phone', 'url', 'default'],
    default: 'default'
  },
  enterKeyType: {
    type: types.string,
    choice: ['default', 'done', 'next', 'send', 'search', 'go'],
    default: 'default'
  },
  messageColor: {type: types.ColorValue, default: 'initial'},
  focused: {type: types.boolean, nocache: true},
  borderColor: {type: types.ColorValue, default: 'initial'},
  textColor: {type: types.ColorValue, default: 'initial'},
  revealPassword: {type: types.boolean, default: false},
  cursorColor: {type: types.ColorValue, default: 'initial'},
  selection: {
    type: {
      convert(value, textInput) {
        if (!(value instanceof Array) || value.length !== 2) {
          throw new Error(
            `Selection has to be a two element array with start and end position but is ${toValueString(value)}`
          );
        }
        const textLength = textInput.text.length;
        const result = value.map(num => types.number.convert(num));
        if (result[1] > textLength || result[0] > textLength || result[1] < 0 || result[0] < 0) {
          throw new Error(`The selection has to be in the range of 0 to text length [0-${textLength}] but is ${value}`);
        }
        return Object.freeze(result);
      }
    },
    nocache: true
  },
  font: {type: types.FontValue, default: 'initial'},
  keyboardAppearanceMode: {
    type: types.string,
    choice: ['never', 'ontouch', 'onfocus'],
    default: 'onfocus'
  },
});

NativeObject.defineEvents(TextInput.prototype, {
  focus: {native: true, changes: 'focused', changeValue: () => true},
  blur: {native: true, changes: 'focused', changeValue: () => false},
  accept: {native: true},
  input: {native: true, changes: 'text'},
  select: {native: true, changes: 'selection'}
});
