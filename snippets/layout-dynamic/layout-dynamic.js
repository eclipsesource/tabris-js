var page = new tabris.Page({
  title: "Layout - Dynamic Positioning",
  topLevel: true
});

new tabris.Composite({id: "red", background: "red"}).appendTo(page);
new tabris.Composite({id: "green", background: "green"}).appendTo(page);
new tabris.Composite({id: "blue", background: "blue"}).appendTo(page);
new tabris.Composite({id: "yellow", background: "yellow"}).appendTo(page);
new tabris.Composite({id: "purple", background: "purple"}).appendTo(page);

page.on("resize", function(page, bounds) {
  page.apply(require("./layout-" + (bounds.width > bounds.height ? "landscape" : "portrait")));
}).open();
