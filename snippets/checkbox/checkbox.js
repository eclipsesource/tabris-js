tabris.load(function() {
  var page = tabris.create("Page", {
    title: "Creating a checkbox with a selection handler",
    topLevel: true
  });

  var checkbox = tabris.create("CheckBox", {
    layoutData: {left: 0, top: 0},
    text: "Checkbox"
  }).on("change:selection", function() {
    console.log("Checkbox " + (checkbox.get("selection") ? "selected" : "deselected") + ".");
  }).appendTo(page);

  page.open();
});
