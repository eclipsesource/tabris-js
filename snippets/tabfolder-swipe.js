var tabFolder = new tabris.TabFolder({
  left: 0, top: 0, right: 0, bottom: 0,
  paging: true,
  tabBarLocation: 'hidden'
}).appendTo(tabris.ui.contentView);

for (var i = 1; i <= 3; i++) {
  createTab('Page ' + i);
}

function createTab(text) {
  var tab = new tabris.Tab().appendTo(tabFolder);
  new tabris.TextView({
    centerX: 0, centerY: 0,
    text: text
  }).appendTo(tab);
}
