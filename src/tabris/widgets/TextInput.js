import Widget from '../Widget';

export default Widget.extend({
  _name: 'TextInput',
  _type: 'tabris.TextInput',
  _events: {
    focus: {
      trigger: function() {
        this.trigger('focus', this);
      }
    },
    blur:  {
      trigger: function() {
        this.trigger('blur', this);
      }
    },
    accept: {
      trigger: function(event) {
        this.trigger('accept', this, event.text, {});
      }
    },
    input: {
      alias: 'change:text',
      trigger: function(event) {
        this._triggerChangeEvent('text', event.text);
        this.trigger('input', this, event.text, {});
      }
    }
  },
  _properties: {
    type: ['choice', ['default', 'password', 'search', 'multiline']],
    text: {type: 'string', nocache: true},
    message: {type: 'string', default: ''},
    editable: {type: 'boolean', default: true},
    alignment: {type: ['choice', ['left', 'center', 'right']], default: 'left'},
    autoCorrect: {type: 'boolean', default: false},
    autoCapitalize: {type: 'boolean', default: false},
    keyboard: {
      type: ['choice', ['ascii', 'decimal', 'email', 'number', 'numbersAndPunctuation', 'phone', 'url', 'default']],
      default: 'default'
    },
    focused: {type: 'boolean', nocache: true}
  }
});
