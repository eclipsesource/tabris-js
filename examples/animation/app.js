const animationPage = require('./simple');
const peoplePage = require('./people');
const trayPage = require('./tray');
const {Button, NavigationView, Page, contentView} = require('tabris');

const navigationView = new NavigationView({
  left: 0, top: 0, right: 0, bottom: 0
}).appendTo(contentView);

const mainPage = new Page({
  title: 'Animation Examples'
}).appendTo(navigationView);

[animationPage, peoplePage, trayPage].forEach((page) => {
  new Button({
    left: 8, top: 'prev() 8', right: 8,
    text: page.title
  }).on('select', () => page.appendTo(navigationView))
    .appendTo(mainPage);
});
