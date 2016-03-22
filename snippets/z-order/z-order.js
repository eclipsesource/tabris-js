var page = new tabris.Page({
  title: "Z-Order",
  topLevel: true
});

["red", "green", "blue"].forEach(function(color, index) {
  var offset = 50 + index * 50;
  new tabris.Composite({
    layoutData: {left: offset, top: offset, width: 100, height: 100},
    background: color
  }).appendTo(page);
});

page.open();
