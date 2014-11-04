tabris.load(function() {

  var page = tabris.create("Page", {
    title: "Relative positioning",
    topLevel: true
  });

  var composite1 = tabris.create("Composite", {
    layoutData: {left: 0, top: 0, width: 100, height: 100},
    background: "red"
  }).appendTo(page);

  tabris.create("Composite", {
    layoutData: {left: [composite1, 15], top: [composite1, 15], width: 100, height: 100},
    background: "blue"
  }).appendTo(page);

  page.open();

});
