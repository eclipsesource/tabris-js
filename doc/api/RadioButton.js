import {RadioButton, contentView} from 'tabris';

new RadioButton({text: 'One', checked: true})
  .onSelect(event => console.log(`Checked: ${event.checked}`))
  .appendTo(contentView);

new RadioButton({text: 'Two'})
  .onSelect(event => console.log(`Checked: ${event.checked}`))
  .appendTo(contentView);
