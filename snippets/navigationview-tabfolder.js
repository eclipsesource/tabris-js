// demonstrates NavigationViews as children of a TabFolder

var tabFolder = new tabris.TabFolder({
  left: 0, top: 0, right: 0, bottom: 0,
  tabBarLocation: 'bottom',
  background: 'white'
}).appendTo(tabris.ui.contentView);

function createTab(title, image) {
  var tab = new tabris.Tab({
    title: title,
    image: {src: image, scale: 2}
  }).appendTo(tabFolder);
  var navigationView = new tabris.NavigationView({
    id: 'navigationView',
    left: 0, top: 0, right: 0, bottom: 0
  }).appendTo(tab);
  createPage(navigationView, title);
}

function createPage(navigationView, title) {
  var text = title || 'Page ' + (navigationView.pages().length + 1);
  var page = new tabris.Page({
    title: text,
    background: '#eeeeee'
  }).appendTo(navigationView);
  var controls = new tabris.Composite({
    centerX: 0, centerY: 0
  }).appendTo(page);
  new tabris.TextView({
    centerX: 0,
    text
  }).appendTo(controls);
  new tabris.Button({
    top: 'prev() 16', centerX: 0,
    text: 'Add Page'
  }).on('select', function() {
    createPage(navigationView);
  }).appendTo(controls);
  new tabris.Button({
    top: 'prev() 16', centerX: 0,
    text: 'Remove Page'
  }).on('select', function() {
    page.dispose();
  }).appendTo(controls);
}

createTab('Cart', 'images/cart.png');
createTab('Pay', 'images/card.png');
createTab('Statistic', 'images/chart.png');

tabris.app.on('backNavigation', function(event) {
  // handle the "physical" back button on Android
  var navigationView = tabFolder.selection.find('#navigationView').first();
  var page = navigationView.pages().last();
  if (page !== undefined) {
    page.dispose();
    event.preventDefault();
  }
});
