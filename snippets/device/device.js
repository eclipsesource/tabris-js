var page = tabris.create("Page", {
  title: "Device Info",
  topLevel: true
});

["platform", "version", "model", "language", "orientation"].forEach(function(property) {
  tabris.create("TextView", {
    id: property,
    layoutData: {left: 10, right: 10, top: [page.children().last(), 10]},
    text: property + ": " + tabris.device.get(property)
  }).appendTo(page);
});

tabris.device.on("change:orientation", function(target, value) {
  page.find("#orientation").set("text", "orientation: " + value);
});

page.open();
