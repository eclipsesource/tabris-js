let navigationView = new tabris.NavigationView({
  left: 0, top: 0, right: 0, bottom: 0,
  drawerActionVisible: true,
  pageAnimation: 'none',
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

let pageConfigs = [
  {title: 'Basket', icon: 'images/page.png'},
  {title: 'Checkout', icon: 'images/page.png'}
];

let pageSelector = new tabris.CollectionView({
  left: 0, top: 'prev()', right: 0, bottom: 0,
  itemCount: pageConfigs.length,
  createCell: createCell,
  updateCell: updateCell,
  cellHeight: 48
}).on('select', ({index}) => {
  tabris.ui.drawer.close();
  navigationView.pages().dispose();
  createPage(pageConfigs[index]).appendTo(navigationView);
}).appendTo(tabris.ui.drawer);

createPage({title: 'Initial Page', icon: 'images/page.png'}).appendTo(navigationView);

function createCell() {
  let cell = new tabris.Composite();
  if (tabris.device.platform !== 'windows') {
    new tabris.Composite({
      left: tabris.device.platform === 'iOS' ? 60 : 72, right: 0, bottom: 0, height: 1,
      background: '#e7e7e7'
    }).appendTo(cell);
  }
  new tabris.ImageView({
    left: select({iOS: 14, Android: 14, windows: 8}), top: 10, bottom: 10
  }).appendTo(cell);
  new tabris.TextView({
    left: select({iOS: 60, Android: 72, windows: 56}), centerY: 0,
    font: select({iOS: '17px .HelveticaNeueInterface-Regular', Android: '14px Roboto Medium', windows: '18px default'}),
    textColor: '#212121'
  }).appendTo(cell);
  return cell;
}

function updateCell(cell, index) {
  let page = pageConfigs[index];
  console.log('update', index, page);
  cell.apply({
    ImageView: {image: {src: page.icon, scale: 3}},
    TextView: {text: page.title}
  });
}

function createPage(config) {
  let page = new tabris.Page({title: config.title});
  page.icon = config.icon;
  new tabris.Button({
    left: 20, right: 20, top: 20,
    text: 'Create page in drawer'
  }).on('select', () => {
    pageConfigs.push({title: 'Another Page', icon: 'images/page.png'});
    pageSelector.insert(pageConfigs.length - 1);
  }).appendTo(page);
  return page;
}

function select(options) {
  return options[tabris.device.platform];
}
