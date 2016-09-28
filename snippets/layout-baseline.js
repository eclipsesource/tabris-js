var textView = new tabris.TextView({
  layoutData: {left: 20, top: 20},
  text: 'Label:'
}).appendTo(tabris.ui.contentView);

new tabris.TextInput({
  layoutData: {left: [textView, 10], width: 300, baseline: textView},
  message: 'Text'
}).appendTo(tabris.ui.contentView);
