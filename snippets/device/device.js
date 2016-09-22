["platform", "version", "model", "language", "orientation"].forEach(function(property) {
  new tabris.TextView({
    id: property,
    layoutData: {left: 10, right: 10, top: "prev() 10"},
    text: property + ": " + tabris.device.get(property)
  }).appendTo(tabris.ui.contentView);
});

tabris.device.on("change:orientation", function(target, value) {
  tabris.ui.contentView.find("#orientation").set("text", "orientation: " + value);
});
