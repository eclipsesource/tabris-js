import {Button, InactivityTimer, TextView, contentView} from 'tabris';

new TextView({
  centerX: 0, top: 16,
  text: ''
}).appendTo(contentView);

new Button({
  centerX: 0, top: 'prev()',
  text: 'Start'
}).onSelect(() => {
  timer.start();
  label.text = 'started';
}).appendTo(contentView);
new Button({
  centerX: 0, top: 'prev()',
  text: 'Cancel'
}).onSelect(() => {
  timer.cancel();
  label.text = 'cancelled';
}).appendTo(contentView);

const label = $(TextView).only();

const timer = new InactivityTimer({delay: 2000})
  .onTimeout(() => label.text = 'inactive!');
