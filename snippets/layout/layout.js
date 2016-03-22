var page = new tabris.Page({
  title: "Layout - Absolute",
  topLevel: true
});

new tabris.Composite({
  layoutData: {left: 20, top: 20, width: 100, height: 100},
  background: "red"
}).appendTo(page);

page.open();
