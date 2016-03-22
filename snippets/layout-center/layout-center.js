var page = new tabris.Page({
  title: "Layout - Centering",
  topLevel: true
});

new tabris.Composite({
  layoutData: {centerX: 0, centerY: 0, width: 100, height: 100},
  background: "red"
}).appendTo(page);

page.open();
