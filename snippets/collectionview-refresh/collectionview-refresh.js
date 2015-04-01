var page = tabris.create("Page", {
  title: "Collection View",
  topLevel: true
});

var view = tabris.create("CollectionView", {
  layoutData: {left: 0, top: 0, right: 0, bottom: 0},
  itemHeight: 25,
  refreshEnabled: true,
  initializeCell: function(cell) {
    var textView = tabris.create("TextView", {
      layoutData: {top: 2, bottom: 2, left: 5, right: 5}
    }).appendTo(cell);
    cell.on("change:item", function(widget, item) {
      textView.set("text", item);
    });
  }
}).on("refresh", function() {
  loadItems();
}).appendTo(page);

loadItems();

page.open();

function loadItems() {
  view.set({
    refreshIndicator: true,
    refreshMessage: "loading..."
  });
  setTimeout(function() {
    view.set({
      items: createNewItems(),
      refreshIndicator: false,
      refreshMessage: ""
    });
  }, 1000);
}

var count = 1;
function createNewItems() {
  var items = [];
  for (var i = 0; i < 25; i++) {
    items.push("Item " + count++);
  }
  return items;
}
