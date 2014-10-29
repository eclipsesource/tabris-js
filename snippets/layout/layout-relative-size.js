tabris.load(function() {

  var MARGIN = 15;

  var page = tabris.create("Page", {
    title: "Layouting a widget by percentage",
    topLevel: true
  });

  var composite1 = tabris.create("Composite", {
    layoutData: {left: MARGIN, top: MARGIN, right: MARGIN, bottom: [70, 0]},
    background: "red"
  }).appendTo(page);

  tabris.create("Composite", {
    layoutData: {left: MARGIN, top: [30, MARGIN], right: MARGIN, bottom: MARGIN},
    background: "blue"
  }).appendTo(page);

  page.open();

});
