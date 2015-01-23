var page = tabris.create("Page", {
  title: "Device Info",
  topLevel: true
});

["platform", "version", "model", "language"].forEach(function(property) {
  tabris.create("Label", {
    layoutData: {left: 10, right: 10, top: [page.children().last(), 10]},
    text: property + ": " + device[property]
  }).appendTo(page);
});

page.open();
