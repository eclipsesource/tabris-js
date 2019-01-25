import {
  Button, CollectionView, Composite, ImageView, NavigationView, Page, TextView, contentView, drawer
} from 'tabris';

const PAGE_CONFIGS = [
  {title: 'Basket', icon: 'resources/page.png'},
  {title: 'Checkout', icon: 'resources/page.png'}
];

const navigationView = new NavigationView({
  left: 0, top: 0, right: 0, bottom: 0,
  drawerActionVisible: true,
  pageAnimation: 'none'
}).appendTo(contentView);

drawer.enabled = true;

new ImageView({
  left: 0, right: 0, top: 0, height: 200,
  image: 'resources/landscape.jpg',
  scaleMode: 'fill'
}).appendTo(drawer);

const pageSelector = new CollectionView({
  left: 0, top: 'prev()', right: 0, bottom: 0,
  itemCount: PAGE_CONFIGS.length,
  createCell,
  updateCell,
  cellHeight: 48
}).on('select', ({index}) => {
  drawer.close();
  navigationView.pages().dispose();
  createPage(PAGE_CONFIGS[index]).appendTo(navigationView);
}).appendTo(drawer);

createPage({title: 'Initial Page', icon: 'resources/page.png'}).appendTo(navigationView);

function createCell() {
  const cell = new Composite();
  new Composite({
    left: device.platform === 'iOS' ? 60 : 72, right: 0, bottom: 0, height: 1,
    background: '#e7e7e7'
  }).appendTo(cell);
  new ImageView({
    left: select({iOS: 14, Android: 14}), top: 10, bottom: 10
  }).appendTo(cell);
  new TextView({
    left: select({iOS: 60, Android: 72}), centerY: 0,
    font: select({iOS: '17px .HelveticaNeueInterface-Regular', Android: '14px Roboto Medium'}),
    textColor: '#212121'
  }).appendTo(cell);
  return cell;
}

function updateCell(cell, index) {
  const page = PAGE_CONFIGS[index];
  cell.apply({
    ImageView: {image: {src: page.icon, scale: 3}},
    TextView: {text: page.title}
  });
}

function createPage(config) {
  const page = new Page({title: config.title});
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
