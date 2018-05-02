import {CheckBox, ui} from 'tabris';

// Create a check box with a checked handler

new CheckBox({
  left: 10, top: 10,
  checked: true,
  text: 'checked'
}).on('checkedChanged', event => event.target.text = event.value ? 'checked' : 'unchecked')
  .appendTo(ui.contentView);
