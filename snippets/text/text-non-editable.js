tabris.load(function() {
  var page = tabris.create("Page", {
    title: "Creating a non-editable text widget",
    topLevel: true
  });

  tabris.create("Text", {
    layoutData: {left: 0, top: 0},
    message: "Non-editable text",
    editable: false
  }).appendTo(page);

  page.open();
});
