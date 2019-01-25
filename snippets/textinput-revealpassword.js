import {TextInput, CheckBox, contentView} from 'tabris';

// Create a password text input field where the password can be revealed or hidden

const textInput = new TextInput({
  left: 16, right: 16, top: 16,
  type: 'password',
  message: 'Test password',
  keepFocus: true
}).appendTo(contentView);

new CheckBox({
  left: 16, right: 16, top: 'prev() 16',
  text: 'Show password'
}).on('checkedChanged', event => textInput.revealPassword = event.value)
  .appendTo(contentView);
