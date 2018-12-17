import {Button, ui} from 'tabris';

new Button({
  centerX: 0, centerY: 0,
  text: 'Press me!'
}).on('select', ({target}) => {
  target.text = 'Please wait...';
  setTimeout(sayThanks, 2000, target);
}).appendTo(ui.contentView);

function sayThanks(widget) {
  widget.text = 'Thank you!';
}
