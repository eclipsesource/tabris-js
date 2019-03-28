import NativeObject from '../NativeObject';
import Widget from '../Widget';
import {JSX} from '../JsxProcessor';

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
  type: {type: ['choice', ['default', 'password', 'search', 'multiline']], const: true, default: 'default'},
  text: {type: 'string', nocache: true},
  message: {type: 'string', default: ''},
  editable: {type: 'boolean', default: true},
  keepFocus: {type: 'boolean', default: false},
  alignment: {type: ['choice', ['left', 'center', 'right']], default: 'left'},
  autoCorrect: {type: 'boolean', default: false},
  autoCapitalize: {
    type: ['choice', [true, false, 'none', 'sentence', 'word', 'all']],
    default: false,
    set(name, value) {
      if (value === true) {
        this._nativeSet(name, 'all');
      } else if (value === false) {
        this._nativeSet(name, 'none');
      } else {
        this._nativeSet(name, value);
      }
      this._storeProperty(name, value);
    }
  },
  keyboard: {
    type: ['choice', ['ascii', 'decimal', 'email', 'number', 'numbersAndPunctuation', 'phone', 'url', 'default']],
    default: 'default'
  },
  enterKeyType: {
    type: ['choice', ['default', 'done', 'next', 'send', 'search', 'go']],
    default: 'default'
  },
  focused: {type: 'boolean', nocache: true},
  fillColor: {type: 'ColorValue'},
  borderColor: {type: 'ColorValue'},
  textColor: {type: 'ColorValue'},
  revealPassword: {type: 'boolean'},
  cursorColor: {type: 'ColorValue'},
  selection: {
    type: 'array',
    set(name, value) {
      if (value.length !== 2) {
        throw new Error(`Selection has to be a two element array with start and end position but is ${value}`);
      }
      const textLength = this.text.length;
      if (value[1] > textLength || value[0] > textLength || value[1] < 0 || value[0] < 0) {
        throw new Error(`The selection has to be in the range of 0 to text length [0-${textLength}] but is ${value}`);
      }
      this._nativeSet(name, value);
      this._triggerChangeEvent('selection', value);
    },
    get(name) {
      return this._nativeGet(name);
    }
  },
  font: {
    type: 'FontValue',
    set(name, value) {
      this._nativeSet(name, value);
      this._storeProperty(name, value);
    },
    default: null
  }
});

NativeObject.defineEvents(TextInput.prototype, {
  focus: {native: true},
  blur: {native: true},
  accept: {native: true},
  input: {native: true, changes: 'text'},
  select: {native: true, changes: 'selection'}
});
