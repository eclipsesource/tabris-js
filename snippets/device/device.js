var page = new tabris.Page({
  title: "Device Info",
  topLevel: true
});

["platform", "version", "model", "language", "orientation"].forEach(function(property) {
  new tabris.TextView({
    id: property,
    layoutData: {left: 10, right: 10, top: "prev() 10"},
    text: property + ": " + tabris.device.get(property)
  }).appendTo(page);
});

tabris.device.on("change:orientation", function(target, value) {
  page.find("#orientation").set("text", "orientation: " + value);
});

page.open();
