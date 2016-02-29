var page = new tabris.Page({
  title: "Composite highlighted on touch",
  topLevel: true
});

new tabris.Composite({
  layoutData: {left: "30%", top: "30%", right: "30%", bottom: "30%"},
  highlightOnTouch: true,
  background: "gray"
}).appendTo(page);

page.open();
