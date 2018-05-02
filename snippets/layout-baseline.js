import {TextInput, TextView, ui} from 'tabris';

let textView = new TextView({
  left: 16, top: 16,
  text: 'Label:'
}).appendTo(ui.contentView);

new TextInput({
  left: [textView, 16], right: 16, baseline: textView,
  message: 'Text'
}).appendTo(ui.contentView);
