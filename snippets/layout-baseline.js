const {TextInput, TextView, ui} = require('tabris');

let textView = new TextView({
  left: 20, top: 20,
  text: 'Label:'
}).appendTo(ui.contentView);

new TextInput({
  left: [textView, 10], width: 300, baseline: textView,
  message: 'Text'
}).appendTo(ui.contentView);
