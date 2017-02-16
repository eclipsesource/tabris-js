var drawer = tabris.ui.drawer;

drawer.enabled = true;

var navigationView = new tabris.NavigationView({
  left: 0, top: 0, right: 0, bottom: 0,
  drawerActionVisible: true,
  animated: false
}).appendTo(tabris.ui.contentView);

new tabris.ImageView({
  left: 0, right: 0, top: 0, height: 200,
  image: 'images/landscape.jpg',
  scaleMode: 'fill'
}).appendTo(drawer);

var pageSelector = new tabris.CollectionView({
  left: 0, top: 'prev()', right: 0, bottom: 0,
  items: [{title: 'Basket', icon: 'images/page.png'}, {title: 'Checkout', icon: 'images/page.png'}],
  initializeCell: initializeCell,
  itemHeight: 48
}).appendTo(drawer);

pageSelector.on('select', function({item: pageConfiguration}) {
  tabris.ui.drawer.close();
  navigationView.pages().dispose();
  createPage(pageConfiguration).appendTo(navigationView);
});

createPage({title: 'Initial Page', icon: 'images/page.png'}).appendTo(navigationView);

function initializeCell(cell) {
  new tabris.Composite({
    left: tabris.device.platform === 'iOS' ? 60 : 72, right: 0, bottom: 0, height: 1,
    background: '#e7e7e7'
  }).appendTo(cell);
  var imageView = new tabris.ImageView({
    left: 14, top: 10, bottom: 10
  }).appendTo(cell);
  var textView = new tabris.TextView({
    left: tabris.device.platform === 'iOS' ? 60 : 72, centerY: 0,
    font: tabris.device.platform === 'iOS' ? '17px .HelveticaNeueInterface-Regular' : '14px Roboto Medium',
    textColor: '#212121'
  }).appendTo(cell);
  cell.on('change:item', function({value: page}) {
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
