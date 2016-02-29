var page = new tabris.Page({
  title: "TabFolder - Swipe",
  topLevel: true
});

var tabFolder = new tabris.TabFolder({
  left: 0, top: 0, right: 0, bottom: 0,
  paging: true,
  tabBarLocation: "hidden"
}).appendTo(page);

for (var i = 1; i <= 3; i++) {
  createTab("Page " + i);
}

page.open();

function createTab(text) {
  var tab = new tabris.Tab().appendTo(tabFolder);
  new tabris.TextView({
    centerX: 0, centerY: 0,
    text: text
  }).appendTo(tab);
}
