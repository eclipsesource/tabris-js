tabris.load(function() {

  var page = tabris.create("Page", {
    title: "Layout - Absolute",
    topLevel: true
  });

  tabris.create("Composite", {
    layoutData: {left: 20, top: 20, width: 100, height: 100},
    background: "red"
  }).appendTo(page);

  page.open();

});
