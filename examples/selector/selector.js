var page = tabris.create("Page", {
  title: "Selector Engine",
  topLevel: true
});

var matchers = ["*", "Button", "TextView", "#btn1", "#text2"];

tabris.create("Picker", {
  items: matchers,
  layoutData: {left: 10, top: 10},
  selectionIndex: 1
}).on("change:selectionIndex", function() {
  var matcher = matchers[this.get("selectionIndex")]; // TODO: Picker.get("text") not working??
  var selected = page.children(matcher);
  selected.set("background", "red");
  window.setTimeout(function() {
    selected.set("background", "rgba(255, 255, 255, 0)");
  }, 400);
}).appendTo(page);

tabris.create("Button", {
  id: "btn1",
  text: "Button 1",
  layoutData: {left: 10, top: [page.children().last(), 10]}
}).appendTo(page);

tabris.create("Button", {
  id: "btn2",
  text: "Button 2",
  layoutData: {left: 10, top: [page.children().last(), 10]}
}).appendTo(page);

tabris.create("TextView", {
  id: "text1",
  text: "TextView 1",
  layoutData: {left: 10, top: [page.children().last(), 10]}
}).appendTo(page);

tabris.create("TextView", {
  id: "text2",
  text: "TextView 2",
  layoutData: {left: 10, top: [page.children().last(), 10]}
}).appendTo(page);

page.open();
