tabris.load(function() {

  var page = tabris.create("Page", {
    title: "Creating a toggle button with a selection handler",
    topLevel: true
  });

  var toggleButton = tabris.create("ToggleButton", {
    layoutData: {left: 0, top: 0},
    text: "Toggle button"
  }).on("change:selection", function() {
    console.log("Toggle button " + (toggleButton.get("selection") ? "selected" : "deselected") + ".");
  }).appendTo(page);

  page.open();
});
