var page = tabris.create("Page", {
  title: "Layout - Baseline Alignment",
  topLevel: true
});

var textView = tabris.create("TextView", {
  layoutData: {left: 20, top: 20},
  text: "Label:"
}).appendTo(page);

tabris.create("TextInput", {
  layoutData: {left: [textView, 10], width: 300, baseline: textView},
  message: "Text"
}).appendTo(page);

page.open();
