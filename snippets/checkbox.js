import {CheckBox, contentView} from 'tabris';

// Create a check box with a checked handler

new CheckBox({
  left: 10, top: 10,
  checked: true,
  text: 'checked'
}).onCheckedChanged(event => event.target.text = event.value ? 'checked' : 'unchecked')
  .appendTo(contentView);
