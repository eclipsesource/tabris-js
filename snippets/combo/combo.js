var page = tabris.create("Page", {
  title: "Combo Box",
  topLevel: true
});

var items = ["North", "East", "South", "West"];

tabris.create("Combo", {
  layoutData: {left: 20, top: 20, right: 20},
  items: items,
  selectionIndex: 1
}).on("change:selection", function() {
  var selectionIndex = this.get("selectionIndex");
  console.log("Heading " + items[selectionIndex]);
}).appendTo(page);

page.open();
