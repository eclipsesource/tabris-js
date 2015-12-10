var page = tabris.create("Page", {
  title: "TabFolder - Swipe",
  topLevel: true
});

var tabFolder = tabris.create("TabFolder", {
  left: 0, top: 0, right: 0, bottom: 0,
  paging: true,
  tabBarLocation: "hidden"
}).appendTo(page);

for (var i = 1; i <= 3; i++) {
  createTab("Page " + i);
}

page.open();

function createTab(text) {
  var tab = tabris.create("Tab").appendTo(tabFolder);
  tabris.create("TextView", {
    centerX: 0, centerY: 0,
    text: text
  }).appendTo(tab);
}
