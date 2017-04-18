var navigationView = new tabris.NavigationView({
  left: 0, top: 0, right: 0, bottom: 0,
  drawerActionVisible: true,
  animated: false,
  win_drawerActionBackground: '#009688',
  win_drawerActionTheme: 'dark'
}).appendTo(tabris.ui.contentView);

tabris.ui.drawer.set({
  enabled: true,
  win_targetView: navigationView,
  win_displayMode: 'compactOverlay'
});

if (tabris.device.platform !== 'windows') {
  new tabris.ImageView({
    left: 0, right: 0, top: 0, height: 200,
    image: 'images/landscape.jpg',
    scaleMode: 'fill'
  }).appendTo(tabris.ui.drawer);
}

var pageSelector = new tabris.CollectionView({
  left: 0, top: 'prev()', right: 0, bottom: 0,
  items: [{title: 'Basket', icon: 'images/page.png'}, {title: 'Checkout', icon: 'images/page.png'}],
  initializeCell: initializeCell,
  itemHeight: 48
}).appendTo(tabris.ui.drawer);

pageSelector.on('select', function({item: pageConfiguration}) {
  tabris.ui.drawer.close();
  navigationView.pages().dispose();
  createPage(pageConfiguration).appendTo(navigationView);
});

createPage({title: 'Initial Page', icon: 'images/page.png'}).appendTo(navigationView);

function initializeCell(cell) {
  if (tabris.device.platform !== 'windows') {
    new tabris.Composite({
      left: tabris.device.platform === 'iOS' ? 60 : 72, right: 0, bottom: 0, height: 1,
      background: '#e7e7e7'
    }).appendTo(cell);
  }
  var imageView = new tabris.ImageView({
    left: select({iOS: 14, Android: 14, windows: 8}), top: 10, bottom: 10
  }).appendTo(cell);
  var textView = new tabris.TextView({
    left: select({iOS: 60, Android: 72, windows: 56}), centerY: 0,
    font: select({iOS: '17px .HelveticaNeueInterface-Regular', Android: '14px Roboto Medium', windows: '18px default'}),
    textColor: '#212121'
  }).appendTo(cell);
  cell.on('itemChanged', function({value: page}) {
    imageView.image = {src: page.icon, scale: 3};
    textView.text = page.title;
  });
}

function createPage(pageConfiguration) {
  var page = new tabris.Page({title: pageConfiguration.title});
  page.icon = pageConfiguration.icon;
  new tabris.Button({
    left: 20, right: 20, top: 20,
    text: 'Create page in drawer'
  }).on('select', function() {
    pageSelector.insert([{title: 'Another Page', icon: 'images/page.png'}]);
  }).appendTo(page);
  return page;
}

function select(options) {
  return options[tabris.device.platform];
}
