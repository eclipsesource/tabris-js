var page = tabris.create("Page", {
  title: "Collection View",
  topLevel: true
});

tabris.create("CollectionView", {
  layoutData: {left: 0, top: 0, right: 0, bottom: 0},
  items: createItems(),
  cellType: function(item) {
    return item.type;
  },
  itemHeight: function(item, type) {
    return type === "section" ? 30 : 24;
  },
  initializeCell: function(cell, type) {
    var textView = tabris.create("TextView", {
      layoutData: {top: 2, bottom: 2, left: 5, right: 5},
      font: type === "section" ? "bold 18px" : "14px"
    }).appendTo(cell);
    if (type === "section") {
      cell.set("background", "#cecece");
    }
    cell.on("change:item", function(widget, item) {
      textView.set("text", item.name);
    });
  }
}).appendTo(page);

page.open();

function createItems() {
  var count = 1;
  var items = [];
  ["Section 1", "Section 2", "Section 3"].forEach(function(name) {
    items.push({name: name, type: "section"});
    for (var i = 0; i < 25; i++) {
      items.push({name: "Item " + count++, type: "item"});
    }
  });
  return items;
}
