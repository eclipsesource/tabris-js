var pageCount = 0;

createPage("Initial Page", true);

function createPage(title, topLevel) {
  var page = tabris.create("Page", {
    title: title,
    topLevel: topLevel
  }).open();

  tabris.create("Button", {
    layoutData: {left: 10, top: 10, right: 10},
    text: "Create another page"
  }).on("selection", function() {
    createPage("Page " + (++pageCount), false);
  }).appendTo(page);
}
