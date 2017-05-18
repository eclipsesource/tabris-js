const {Button, TextInput, ui} = require('tabris');

let logTextInput = new TextInput({
  left: 10, top: 20, right: 10,
  text: 'Message',
  message: 'Log message'
}).appendTo(ui.contentView);

['debug', 'log', 'info', 'warn', 'error'].forEach((method) => {
  new Button({
    left: 10, right: 10, top: 'prev() 10',
    text: method
  }).on('select', () => console[method](logTextInput.text))
    .appendTo(ui.contentView);
});
