var page = new tabris.Page({
  title: "Collection View",
  topLevel: true
});

new tabris.CollectionView({
  layoutData: {left: 0, top: 0, right: 0, bottom: 0},
  items: createItems(),
  cellType: function(item) {
    return item.type;
  },
  itemHeight: function(item, type) {
    return type === "section" ? 48 : 24;
  },
  initializeCell: function(cell, type) {
    var textView = new tabris.TextView({
      layoutData: {top: 2, bottom: 2, left: 5, right: 5},
      font: type === "section" ? "bold 28px" : "14px",
      alignment: type === "section" ? "center" : "left"
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
