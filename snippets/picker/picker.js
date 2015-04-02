var page = tabris.create("Page", {
  title: "Picker",
  topLevel: true
});

var items = ["North", "East", "South", "West"];

tabris.create("Picker", {
  layoutData: {left: 20, top: 20, right: 20},
  items: items,
  selectionIndex: 1
}).on("change:selectionIndex", function(picker, selectionIndex) {
  console.log("Heading " + items[selectionIndex]);
}).appendTo(page);

page.open();
