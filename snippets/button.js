import {Button, contentView} from 'tabris';

// Create a push button that counts up on selection

let count = 0;

new Button({
  left: 10, top: 10,
  text: 'Button'
}).onSelect(({target}) => target.text = 'Pressed ' + (++count) + ' times')
  .appendTo(contentView);
