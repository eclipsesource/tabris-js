import Widget from '../Widget';

const CONFIG = {
  _name: 'TextInput',
  _type: 'tabris.TextInput',
  _events: {
    focus: true,
    blur:  true,
    accept: true,
    input: true
  },
  _properties: {
    type: ['choice', ['default', 'password', 'search', 'multiline']],
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
    focused: {type: 'boolean', nocache: true},
    fillColor: {type: 'color'},
    borderColor: {type: 'color'}
  }
};

export default class TextInput extends Widget.extend(CONFIG) {

  _listen(name, listening) {
    if (name === 'change:text') {
      this._onoff('input', listening, this.$triggerChangeSelection);
    } else {
      super._listen(name, listening);
    }
  }

  $triggerChangeSelection({text}) {
    this._triggerChangeEvent('text', text);
  }

}
