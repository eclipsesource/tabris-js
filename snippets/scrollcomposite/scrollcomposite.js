tabris.load(function() {

  var page = tabris.create("Page", {
    title: "Scroll Composite - Horizontal",
    topLevel: true
  });

  var scrollComposite = tabris.create("ScrollComposite", {
    direction: "horizontal",
    layoutData: {left: 0, top: [40, 0], right: 0, bottom: [40, 0]},
    background: "#234"
  }).appendTo(page);

  for (var i = 0; i < 50; i++) {
    tabris.create("Label", {
      layoutData: {left: i * 30 + 20, centerY: 0, width: 30},
      text: i + "°",
      foreground: "white"
    }).appendTo(scrollComposite);
  }

  page.open();

});
