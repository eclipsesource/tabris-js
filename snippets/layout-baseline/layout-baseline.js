var page = new tabris.Page({
  title: "Layout - Baseline Alignment",
  topLevel: true
});

var textView = new tabris.TextView({
  layoutData: {left: 20, top: 20},
  text: "Label:"
}).appendTo(page);

new tabris.TextInput({
  layoutData: {left: [textView, 10], width: 300, baseline: textView},
  message: "Text"
}).appendTo(page);

page.open();
