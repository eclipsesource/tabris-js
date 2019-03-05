import {Button, contentView} from 'tabris';

new Button({
  centerX: 0, centerY: 0,
  text: 'Press me!'
}).onSelect(({target}) => {
  target.text = 'Please wait...';
  setTimeout(sayThanks, 2000, target);
}).appendTo(contentView);

function sayThanks(widget) {
  widget.text = 'Thank you!';
}
