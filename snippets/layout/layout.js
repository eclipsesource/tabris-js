tabris.load(function() {

  var MARGIN = 15;

  var page = tabris.create("Page", {
    title: "Layouting a widget with a fixed size",
    topLevel: true
  });

  tabris.create("Composite", {
    layoutData: {left: MARGIN, top: MARGIN, width: 100, height: 100},
    background: "red"
  }).appendTo(page);

  page.open();

});
