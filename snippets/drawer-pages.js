var drawer = tabris.ui.drawer;

drawer.enabled = true;

var navigationView = new tabris.NavigationView({
  left: 0, top: 0, right: 0, bottom: 0,
  drawerActionVisible: true
}).appendTo(tabris.ui.contentView);

new tabris.ImageView({
  left: 0, right: 0, top: 0, height: 200,
  image: 'images/cover.jpg',
  scaleMode: 'fill'
}).appendTo(drawer);

var pageSelector = new tabris.CollectionView({
  left: 0, top: 'prev()', right: 0, bottom: 0,
  items: [{title: 'Page 1', image: 'images/page.png'}, {title: 'Page 2', image: 'images/page.png'}],
  initializeCell: initializeCell,
  itemHeight: tabris.device.platform === 'iOS' ? 40 : 48
}).appendTo(drawer);

pageSelector.on('select', function(target, pageDescriptor) {
  tabris.ui.drawer.close();
  navigationView.pages().dispose();
  createPage(pageDescriptor).appendTo(navigationView);
});

createPage({title: 'Initial Page', image: 'images/page.png'}).appendTo(navigationView);

function initializeCell(cell) {
  new tabris.Composite({
    left: 0, right: 0, bottom: 0, height: 1,
    background: '#bbb'
  }).appendTo(cell);
  var imageView = new tabris.ImageView({
    left: 10, top: 10, bottom: 10
  }).appendTo(cell);
  var textView = new tabris.TextView({
    left: 72, centerY: 0,
    font: tabris.device.platform === 'iOS' ? '17px .HelveticaNeueInterface-Regular' : '14px Roboto Medium',
    textColor: tabris.device.platform === 'iOS' ? 'rgb(22, 126, 251)' : '#212121'
  }).appendTo(cell);
  cell.on('change:item', function(widget, page) {
    imageView.image = page.image;
    textView.text = page.title;
  });
}

function createPage(pageDescriptor) {
  var page = new tabris.Page(pageDescriptor);
  new tabris.Button({
    left: 20, right: 20, top: 20,
    text: 'Create another page'
  }).on('select', function() {
    pageSelector.insert([{title: 'Another Page', image: 'images/page.png'}]);
  }).appendTo(page);
  return page;
}
