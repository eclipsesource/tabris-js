import {Button, Composite, NavigationView, Page, Tab, TabFolder, TextView, app, ui} from 'tabris';

// demonstrates NavigationViews as children of a TabFolder

let tabFolder = new TabFolder({
  left: 0, top: 0, right: 0, bottom: 0,
  tabBarLocation: 'bottom',
  background: 'white'
}).appendTo(ui.contentView);

function createTab(title, image) {
  let tab = new Tab({
    title,
    image: {src: image, scale: 2}
  }).appendTo(tabFolder);
  let navigationView = new NavigationView({
    id: 'navigationView',
    left: 0, top: 0, right: 0, bottom: 0
  }).appendTo(tab);
  createPage(navigationView, title);
}

function createPage(navigationView, title) {
  let text = title || 'Page ' + (navigationView.pages().length + 1);
  let page = new Page({
    title: text,
    background: '#eeeeee'
  }).appendTo(navigationView);
  let controls = new Composite({
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
  let navigationView = tabFolder.selection.find('#navigationView').first();
  let page = navigationView.pages().last();
  if (page !== undefined) {
    page.dispose();
    event.preventDefault();
  }
});
