tabris.load(function() {
  var page = tabris.create("Page", {
    title: "Text Field / Focus Listener",
    topLevel: true
  });

  tabris.create("Text", {
    layoutData: {top: 20, left: [20, 0], right: [20, 0]},
    message: "Colorful typing...",
    font: "22px sans-serif"
  }).on("focus", function() {
    this.set("background", "yellow");
  }).on("blur", function() {
    this.set("background", "red");
  }).appendTo(page);

  tabris.create("Text", {
    layoutData: {top: [page.children().last(), 20], left: [20, 0], right: [20, 0]},
    message: "Another field to focus..."
  }).appendTo(page);

  page.open();
});
