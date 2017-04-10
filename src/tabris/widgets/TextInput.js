import NativeObject from '../NativeObject';
import Widget from '../Widget';

const EVENT_TYPES = ['focus', 'blur', 'accept', 'input'];

export default class TextInput extends Widget {

  get _nativeType() {
    return 'tabris.TextInput';
  }

  _listen(name, listening) {
    if (EVENT_TYPES.includes(name)) {
      this._nativeListen(name, listening);
    } else if (name === 'change:text') {
      this._onoff('input', listening, this.$triggerChangeSelection);
    } else {
      super._listen(name, listening);
    }
  }

  $triggerChangeSelection({text}) {
    this._triggerChangeEvent('text', text);
  }

}

NativeObject.defineProperties(TextInput.prototype, {
  type: {type: ['choice', ['default', 'password', 'search', 'multiline']]},
  text: {type: 'string', nocache: true},
  message: {type: 'string', default: ''},
  editable: {type: 'boolean', default: true},
  keepFocus: {type: 'boolean'},
  alignment: {type: ['choice', ['left', 'center', 'right']], default: 'left'},
  autoCorrect: {type: 'boolean', default: false},
  autoCapitalize: {type: 'boolean', nocache: true},
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
  borderColor: {type: 'color'}
});
