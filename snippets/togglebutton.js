import {ToggleButton, contentView} from 'tabris';

// Create a toggle button with a checked handler

new ToggleButton({
  left: 10, top: 10,
  text: 'checked',
  checked: true
}).onCheckedChanged(event => event.target.text = event.value ? 'checked' : 'not checked')
  .appendTo(contentView);
