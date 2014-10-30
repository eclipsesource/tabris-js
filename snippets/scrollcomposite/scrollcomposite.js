tabris.load(function() {
  var lastLabel;

  var page = tabris.create("Page", {
    title: "Creating a scroll composite with text",
    topLevel: true
  });

  var scrollComposite = tabris.create("ScrollComposite", {
    scroll: "horizontal",
    layoutData: {left: 0, top: [40,0], right: 0, bottom: [40,0]},
    background: "#234"
  }).appendTo(page);

  for (var i = 0; i < 50; i++) {
    lastLabel = tabris.create("Label", {
      layoutData: {left: i*30+20, centerY: 0, width: 30 },
      text: i + "°",
      foreground: "white"
    }).appendTo(scrollComposite);
  }

  page.open();
});
