var pageCount = 0;

createPage("Initial Page", true);

function createPage(title, topLevel) {
  var page = new tabris.Page({
    title: title,
    topLevel: topLevel
  }).open();

  new tabris.Button({
    layoutData: {left: 10, top: 10, right: 10},
    text: "Create another page"
  }).on("select", function() {
    createPage("Page " + (++pageCount), false);
  }).appendTo(page);
}
