var page = tabris.create("Page", {
  title: "Layout - Relative Positioning",
  topLevel: true
});

var composite1 = tabris.create("Composite", {
  layoutData: {left: 0, top: 0, width: 100, height: 100},
  background: "red"
}).appendTo(page);

tabris.create("Composite", {
  layoutData: {left: [composite1, 10], top: [composite1, 10], width: 100, height: 100},
  background: "blue"
}).appendTo(page);

page.open();
