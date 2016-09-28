createPage('Page 1').open();
createPage('Page 2');

var drawer = new tabris.Drawer();

new tabris.ImageView({
  image: 'images/cover.jpg',
  scaleMode: 'fill',
  layoutData: {left: 0, right: 0, top: 0, height: 200}
}).appendTo(drawer);

new tabris.PageSelector({
  layoutData: {left: 0, top: 200, right: 0, bottom: 0}
}).appendTo(drawer);

function createPage(title) {
  var page = new tabris.Page({
    title: title,
    image: 'images/page.png',
    topLevel: true
  });
  new tabris.Button({
    text: 'Create another page',
    layoutData: {left: 20, right: 20, top: 20}
  }).on('select', function() {
    createPage('Another Page');
  }).appendTo(page);
  return page;
}
