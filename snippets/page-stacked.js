var pageCount = 0;
var navigationView = new tabris.NavigationView({
  left: 0, top: 0, right: 0, bottom: 0,
  drawerActionVisible: true
}).appendTo(tabris.ui.contentView);

var page = createPage();

navigationView.stack.push(page);

function createPage(title) {
  var page = new tabris.Page({
    title: title || 'Initial Page'
  });
  new tabris.Button({
    left: 16, top: 16, right: 16,
    text: 'Create another page'
  }).on('select', function() {
    navigationView.stack.push(createPage('Page ' + (++pageCount)));
  }).appendTo(page);
  new tabris.Button({
    left: 16, top: 'prev() 16', right: 16,
    text: 'Go back'
  }).on('select', function() {
    navigationView.stack.pop();
  }).appendTo(page);
  new tabris.Button({
    left: 16, top: 'prev() 16', right: 16,
    text: 'Go to initial page'
  }).on('select', function() {
    navigationView.stack.clear();
    navigationView.stack.push(createPage());
  }).appendTo(page);
  return page;
}
