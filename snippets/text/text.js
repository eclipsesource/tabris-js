tabris.load(function() {
  var page = tabris.create("Page", {
    title: "Text Field",
    topLevel: true
  });

  tabris.create("Text", {
    layoutData: {top: 20, left: [20, 0], right: [20, 0]},
    message: "Type here, press 'Done'"
  }).on("accept", function() {
    tabris.create("Label", {
      layoutData: {top: [page.children().last(), 20], left: [20, 0]},
      text: this.get("text")
    }).appendTo(page);
  }).appendTo(page);

  page.open();
});
