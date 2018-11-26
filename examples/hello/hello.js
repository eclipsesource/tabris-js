const {Button, TextView, contentView} = require('tabris');

const button = new Button({
  centerX: 0, top: 100,
  text: 'Show message'
}).appendTo(contentView);

const textView = new TextView({
  centerX: 0, top: [button, 50],
  font: '24px'
}).appendTo(contentView);

button.on('select', () => {
  textView.text = 'Tabris.js rocks!';
});
