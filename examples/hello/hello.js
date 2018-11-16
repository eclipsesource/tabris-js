const {Button, TextView, ui} = require('tabris');

const button = new Button({
  centerX: 0, top: 100,
  text: 'Show message'
}).appendTo(ui.contentView);

const textView = new TextView({
  centerX: 0, top: [button, 50],
  font: '24px'
}).appendTo(ui.contentView);

button.on('select', () => {
  textView.text = 'Tabris.js rocks!';
});
