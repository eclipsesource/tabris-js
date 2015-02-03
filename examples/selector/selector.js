var page = tabris.create("Page", {
  title: "Selector Engine",
  topLevel: true
});

var matchers = ["*", "Button", "TextView"];

tabris.create("Combo", {
  items: matchers,
  layoutData: {left: 10, top: 10}
}).on("change:selection", function() {
  var matcher = matchers[this.get("selectionIndex")]; // TODO: combo.get("text") not working??
  var selected = page.children(matcher);
  selected.set("background", "red");
  window.setTimeout(function() {
    selected.set("background", "rgba(255, 255, 255, 0)");
  }, 400);
}).appendTo(page);

tabris.create("Button", {
  text: "Button 1",
  layoutData: {left: 10, top: [page.children().last(), 10]}
}).appendTo(page);

tabris.create("Button", {
  text: "Button 2",
  layoutData: {left: 10, top: [page.children().last(), 10]}
}).appendTo(page);

tabris.create("TextView", {
  text: "TextView 1",
  layoutData: {left: 10, top: [page.children().last(), 10]}
}).appendTo(page);

tabris.create("TextView", {
  text: "TextView 2",
  layoutData: {left: 10, top: [page.children().last(), 10]}
}).appendTo(page);

page.open();
