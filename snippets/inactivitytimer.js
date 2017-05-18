const {Button, InactivityTimer, TextView, ui} = require('tabris');

let timer = new InactivityTimer({
  delay: 2000
}).on('timeout', () => label.text = 'inactive!');

let label = new TextView({
  centerX: 0, top: 16,
  text: ''
}).appendTo(ui.contentView);

new Button({
  centerX: 0, top: 'prev()',
  text: 'Start'
}).on('select', () => {
  timer.start();
  label.text = 'started';
}).appendTo(ui.contentView);

new Button({
  centerX: 0, top: 'prev()',
  text: 'Cancel'
}).on('select', () => {
  timer.cancel();
  label.text = 'cancelled';
}).appendTo(ui.contentView);
