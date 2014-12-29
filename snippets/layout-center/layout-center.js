var page = tabris.create("Page", {
  title: "Layout - Centering",
  topLevel: true
});

tabris.create("Composite", {
  layoutData: {centerX: 0, centerY: 0, width: 100, height: 100},
  background: "red"
}).appendTo(page);

page.open();
