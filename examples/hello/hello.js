const {Button, TextView} = require('tabris');

const button = new Button({
  centerX: 0, top: 100,
  text: 'Show message'
}).appendTo(tabris.ui.contentView);

const textView = new TextView({
  centerX: 0, top: [button, 50],
  font: '24px'
}).appendTo(tabris.ui.contentView);

button.on('select', () => {
  textView.text = 'Tabris.js rocks!';
});
