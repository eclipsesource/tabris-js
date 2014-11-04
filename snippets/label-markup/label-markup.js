tabris.load(function() {

  var page = tabris.create("Page", {
    title: "Creating a label with markup in text",
    topLevel: true
  });

  tabris.create("Label", {
    layoutData: {left: 10, top: 10, right: 10},
    text: "<b>Bold label text</b> and <i>italic text</i>",
    markupEnabled: true
  }).appendTo(page);

  page.open();

});
