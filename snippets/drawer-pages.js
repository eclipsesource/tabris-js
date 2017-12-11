const {Button, CollectionView, Composite, ImageView, NavigationView, Page, TextView, ui} = require('tabris');

const PAGE_CONFIGS = [
  {title: 'Basket', icon: 'resources/page.png'},
  {title: 'Checkout', icon: 'resources/page.png'}
];

let navigationView = new NavigationView({
  left: 0, top: 0, right: 0, bottom: 0,
  drawerActionVisible: true,
  pageAnimation: 'none',
  win_drawerActionBackground: '#009688',
  win_drawerActionTheme: 'dark'
}).appendTo(ui.contentView);

ui.drawer.set({
  enabled: true,
  win_targetView: navigationView,
  win_displayMode: 'compactOverlay'
});

if (device.platform !== 'windows') {
  new ImageView({
    left: 0, right: 0, top: 0, height: 200,
    image: 'resources/landscape.jpg',
    scaleMode: 'fill'
  }).appendTo(ui.drawer);
}

let pageSelector = new CollectionView({
  left: 0, top: 'prev()', right: 0, bottom: 0,
  itemCount: PAGE_CONFIGS.length,
  createCell: createCell,
  updateCell: updateCell,
  cellHeight: 48
}).on('select', ({index}) => {
  ui.drawer.close();
  navigationView.pages().dispose();
  createPage(PAGE_CONFIGS[index]).appendTo(navigationView);
}).appendTo(ui.drawer);

createPage({title: 'Initial Page', icon: 'resources/page.png'}).appendTo(navigationView);

function createCell() {
  let cell = new Composite();
  if (device.platform !== 'windows') {
    new Composite({
      left: device.platform === 'iOS' ? 60 : 72, right: 0, bottom: 0, height: 1,
      background: '#e7e7e7'
    }).appendTo(cell);
  }
  new ImageView({
    left: select({iOS: 14, Android: 14, windows: 8}), top: 10, bottom: 10
  }).appendTo(cell);
  new TextView({
    left: select({iOS: 60, Android: 72, windows: 56}), centerY: 0,
    font: select({iOS: '17px .HelveticaNeueInterface-Regular', Android: '14px Roboto Medium', windows: '18px default'}),
    textColor: '#212121'
  }).appendTo(cell);
  return cell;
}

function updateCell(cell, index) {
  let page = PAGE_CONFIGS[index];
  cell.apply({
    ImageView: {image: {src: page.icon, scale: 3}},
    TextView: {text: page.title}
  });
}

function createPage(config) {
  let page = new Page({title: config.title});
  page.icon = config.icon;
  new Button({
    left: 20, right: 20, top: 20,
    text: 'Create page in drawer'
  }).on('select', () => {
    PAGE_CONFIGS.push({title: 'Another Page', icon: 'resources/page.png'});
    pageSelector.insert(PAGE_CONFIGS.length - 1);
  }).appendTo(page);
  return page;
}

function select(options) {
  return options[device.platform];
}
