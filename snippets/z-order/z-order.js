var page = tabris.create("Page", {
  title: "Z-Order",
  topLevel: true
});

["red", "green", "blue"].forEach(function(color, index) {
  var offset = 50 + index * 50;
  tabris.create("Composite", {
    layoutData: {left: offset, top: offset, width: 100, height: 100},
    background: color
  }).appendTo(page);
});

page.open();
