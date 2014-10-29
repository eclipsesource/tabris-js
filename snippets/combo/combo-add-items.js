tabris.load(function() {

  var MARGIN = 15;

  var itemsCount = 0;

  var page = tabris.create("Page", {
    title: "Dynamically adding combo items",
    topLevel: true
  });

  var combo = tabris.create("Combo", {
    layoutData: {left: 10, top: 10, right: 10}
  }).appendTo(page);

  tabris.create("Button", {
    layoutData: {left: 0, top: [combo, MARGIN]},
    text: "Add item"
  }).on("selection", function() {
    var items = combo.get("items");
    items.push("Item " + (++itemsCount));
    combo.set("items", items);
    combo.set("selectionIndex", items.length);
  }).appendTo(page);

  page.open();
});
