var pageCount = 0;

var navigationView = new tabris.NavigationView({
  left: 0, top: 0, right: 0, bottom: 0,
  drawerActionVisible: true
}).appendTo(tabris.ui.contentView);

createPage();

function createPage(title) {
  var page = new tabris.Page({
    title: title || 'Initial Page'
  }).appendTo(navigationView);
  new tabris.Button({
    left: 16, top: 16, right: 16,
    text: 'Create another page'
  }).on('select', function() {
    createPage('Page ' + (++pageCount));
  }).appendTo(page);
  new tabris.Button({
    left: 16, top: 'prev() 16', right: 16,
    text: 'Go back'
  }).on('select', function() {
    page.dispose();
  }).appendTo(page);
  new tabris.Button({
    left: 16, top: 'prev() 16', right: 16,
    text: 'Go to initial page'
  }).on('select', function() {
    navigationView.pages().dispose();
    createPage();
  }).appendTo(page);
  return page;
}
