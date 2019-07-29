import {CheckBox, contentView} from 'tabris';

new CheckBox({text: 'Checkbox'})
  .onSelect(event => console.log(`Checkbox checked: ${event.checked}`))
  .appendTo(contentView);
