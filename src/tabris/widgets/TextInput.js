import NativeObject from '../NativeObject';
import Widget from '../Widget';

export default class TextInput extends Widget {

  get _nativeType() {
    return 'tabris.TextInput';
  }

}

NativeObject.defineProperties(TextInput.prototype, {
  type: {type: ['choice', ['default', 'password', 'search', 'multiline']], const: true},
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
  fillColor: {type: 'color'},
  borderColor: {type: 'color'},
  textColor: {type: 'color'},
  revealPassword: {type: 'boolean'},
  cursorColor: {type: 'color'},
  selection: {
    type: 'array',
    set(name, value) {
      if (value.length !== 2) {
        throw new Error(`Selection has to be a two element array with start and end position but is ${value}`);
      }
      let textLength = this.text.length;
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
    type: 'font',
    set(name, value) {
      this._nativeSet(name, value === undefined ? null : value);
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
