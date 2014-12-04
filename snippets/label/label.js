tabris.load(function() {

  var page = tabris.create("Page", {
    title: "Labels",
    topLevel: true
  });

  tabris.create("Label", {
    layoutData: {left: 10, top: 10, right: 10},
    text: "Left",
    alignment: "left"
  }).appendTo(page);

  tabris.create("Label", {
    layoutData: {left: 10, top: [page.children().last(), 10], right: 10},
    text: "Center",
    alignment: "center"
  }).appendTo(page);

  tabris.create("Label", {
    layoutData: {left: 10, top: [page.children().last(), 10], right: 10},
    text: "Right",
    alignment: "right"
  }).appendTo(page);

  page.open();

});
