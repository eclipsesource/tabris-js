const {TextInput, TextView, Button, ui} = require('tabris');

// Create a text input field with text selection

let textInput = new TextInput({
  top: 32, left: 16, right: 16,
  text: 'Hello World',
  focused: true,
  keepFocus: true,
  selection: [6, 11]
}).on('selectionChanged', ({value: selection}) => selectionTextView.text = `Selection changed ${selection}`)
  .appendTo(ui.contentView);

let selectionTextView = new TextView({
  top: 'prev() 96', left: 16, right: 16,
  text: `Selection changed ${textInput.selection}`
}).appendTo(ui.contentView);

new Button({
  top: 'prev() 16', left: 16, right: 16,
  text: 'Get selection'
}).on('select', () => selectionTextView.text = 'Retrieved selection is ' + textInput.selection)
  .appendTo(ui.contentView);

new Button({
  top: 'prev() 16', left: 16, right: 16,
  text: 'Set selection to 6, 11'
}).on('select', () => textInput.selection = [6, 11])
  .appendTo(ui.contentView);
