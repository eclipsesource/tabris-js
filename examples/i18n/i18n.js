var texts = device.language === "de-DE" ? require("./de.json") : require("./en.json");

var MARGIN = 10;

var page = tabris.create("Page", {
  id: "menuPage",
  background: "white",
  topLevel: true
});

tabris.create("Picker", {id: "langPicker", layoutData: {left: 10, top: 10, right: 10}})
  .on("change:selection", function() {
    var selectionIndex = this.get("selectionIndex");
    if (selectionIndex > 0) {
      this.set("selectionIndex", 0);
      page.apply(require("./" + this.get("items")[selectionIndex] + ".json"));
    }
  }).appendTo(page);

tabris.create("CollectionView", {
  id: "menuItemsCV",
  itemHeight: 100,
  layoutData: {left: 0, top: ["#langPicker", 10], right: 0, bottom: 0},
  initializeCell: function(cell) {
    var price = tabris.create("TextView", {
      layoutData: {centerY: 0, right: MARGIN, width: 100},
      alignment: "right",
      font: "18px",
      foreground: "#a4c639"
    }).appendTo(cell);
    var name = tabris.create("TextView", {
      layoutData: {left: MARGIN, top: MARGIN, right: [price, 0]},
      font: "bold 18px"
    }).appendTo(cell);
    var description = tabris.create("TextView", {
      layoutData: {left: MARGIN, top: [name, MARGIN / 2], right: [price, 0]}
    }).appendTo(cell);
    tabris.create("Composite", {
      layoutData: {left: 0, bottom: 0, right: 0, height: 1},
      background: "#e3e3e3"
    }).appendTo(cell);
    cell.on("itemchange", function(item) {
      name.set("text", item.name);
      description.set("text", item.description);
      price.set("text", item.price);
    });
  }
}).appendTo(page);

page.apply(texts);

page.open();
