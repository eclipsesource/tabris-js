import {Button, Composite, NavigationView, Page, Tab, TabFolder, TextView, app, contentView} from 'tabris';

// demonstrates NavigationViews as children of a TabFolder

const tabFolder = new TabFolder({
  left: 0, top: 0, right: 0, bottom: 0,
  tabBarLocation: 'bottom',
  background: 'white'
}).appendTo(contentView);

function createTab(title, image) {
  const tab = new Tab({
    title,
    image: {src: image, scale: 2}
  }).appendTo(tabFolder);
  const navigationView = new NavigationView({
    id: 'navigationView',
    left: 0, top: 0, right: 0, bottom: 0
  }).appendTo(tab);
  createPage(navigationView, title);
}

function createPage(navigationView, title) {
  const text = title || 'Page ' + (navigationView.pages().length + 1);
  const page = new Page({
    title: text,
    background: '#eeeeee'
  }).appendTo(navigationView);
  const controls = new Composite({
    centerX: 0, centerY: 0
  }).appendTo(page);
  new TextView({
    centerX: 0,
    text
  }).appendTo(controls);
  new Button({
    top: 'prev() 16', centerX: 0,
    text: 'Add Page'
  }).on('select', () => createPage(navigationView))
    .appendTo(controls);
  new Button({
    top: 'prev() 16', centerX: 0,
    text: 'Remove Page'
  }).on('select', () => page.dispose())
    .appendTo(controls);
}

createTab('Cart', 'resources/cart.png');
createTab('Pay', 'resources/card.png');
createTab('Statistic', 'resources/chart.png');

app.on('backNavigation', (event) => {
  // handle the "physical" back button on Android
  const navigationView = tabFolder.selection.find('#navigationView').first();
  const page = navigationView.pages().last();
  if (page !== undefined) {
    page.dispose();
    event.preventDefault();
  }
});
