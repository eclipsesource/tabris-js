var textView = new tabris.TextView({
  left: 20, top: 20,
  text: 'Label:'
}).appendTo(tabris.ui.contentView);

new tabris.TextInput({
  left: [textView, 10], width: 300, baseline: textView,
  message: 'Text'
}).appendTo(tabris.ui.contentView);
