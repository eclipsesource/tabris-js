tabris.load(function() {

  var page = tabris.create("Page", {
    title: "Creating a combo with a selection handler",
    topLevel: true
  });

  var combo = tabris.create("Combo", {
    layoutData: {left: 20, top: 20, right: 20},
    items: ["Item 1", "Item 2", "Item 3"],
    selectionIndex: 0
  }).on("change:selection", function() {
    var items = combo.get("items");
    var selectionIndex = combo.get("selectionIndex");
    console.log(items[ selectionIndex ] + " selected.");
  }).appendTo(page);

  page.open();

});
