import {ToggleButton, contentView} from 'tabris';

new ToggleButton({text: 'Toggle button'})
  .onSelect(() => console.log('ToggleButton toggled'))
  .appendTo(contentView);
