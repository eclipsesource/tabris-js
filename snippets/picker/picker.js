var page = tabris.create("Page", {
  title: "Picker",
  topLevel: true
});

tabris.create("Picker", {
  layoutData: {left: 20, top: 20, right: 20},
  items: ["North", "East", "South", "West"],
  selection: "South"
}).on("change:selection", function(picker, item) {
  console.log("Heading " + item);
}).appendTo(page);

page.open();
