import {Button, contentView} from 'tabris';

new Button({text: 'Save'})
  .onSelect(() => console.log('Button tapped'))
  .appendTo(contentView);
