tabris.load(function() {
  var page = tabris.create("Page", {
    title: "Creating a button with a selection handler",
    topLevel: true
  });

  tabris.create("Button", {
    layoutData: {left: 0, top: 0},
    text: "Button"
  }).on("selection", function() {
    console.log("Button selected.");
  }).appendTo(page);

  page.open();
});
