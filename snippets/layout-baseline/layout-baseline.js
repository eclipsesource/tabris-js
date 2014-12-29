var page = tabris.create("Page", {
  title: "Layout - Baseline Alignment",
  topLevel: true
});

var label = tabris.create("Label", {
  layoutData: {left: 20, top: 20},
  text: "Label:"
}).appendTo(page);

tabris.create("Text", {
  layoutData: {left: [label, 10], width: 300, baseline: label},
  message: "Text"
}).appendTo(page);

page.open();
