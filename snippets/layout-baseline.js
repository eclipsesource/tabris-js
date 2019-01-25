import {TextInput, TextView, contentView} from 'tabris';

const textView = new TextView({
  left: 16, top: 16,
  text: 'Label:'
}).appendTo(contentView);

new TextInput({
  left: [textView, 16], right: 16, baseline: textView,
  message: 'Text'
}).appendTo(contentView);
