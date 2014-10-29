tabris.load(function() {

  var page = tabris.create("Page", {
    title: "Widget baseline alignment",
    topLevel: true
  });

  var label = tabris.create("Label", {
    layoutData: {left: 15, top: 15},
    text: "Label:"
  }).appendTo(page);

  tabris.create("Text", {
    layoutData: {left: [label, 15], width: 300, baseline: label},
    message: "Text"
  }).appendTo(page);

  page.open();

});
