var page = tabris.create("Page", {
  title: "Layout - Dynamic Positioning",
  topLevel: true
});

tabris.create("Composite", {id: "red", background: "red"}).appendTo(page);
tabris.create("Composite", {id: "green", background: "green"}).appendTo(page);
tabris.create("Composite", {id: "blue", background: "blue"}).appendTo(page);
tabris.create("Composite", {id: "yellow", background: "yellow"}).appendTo(page);
tabris.create("Composite", {id: "purple", background: "purple"}).appendTo(page);

page.on("change:bounds", function() {
  page.apply(require("./layout-" + orientation()));
}).open();

function orientation() {
  var bounds = page.get("bounds");
  return (bounds.width > bounds.height) ? "landscape" : "portrait";
}
