var MARGIN = 8;

var animationPage = require('./animation.js');
var peoplePage = require('./people.js');
var trayPage = require('./tray.js');

var navigationView = new tabris.NavigationView({
  left: 0, top: 0, right: 0, bottom: 0
}).appendTo(tabris.ui.contentView);

var mainPage = new tabris.Page({
  title: 'Animation Examples'
}).appendTo(navigationView);

[animationPage, peoplePage, trayPage].forEach(function(page) {
  new tabris.Button({
    left: MARGIN, top: ['prev()', MARGIN],
    text: page.title
  }).on('select', function() {page.appendTo(navigationView);}).appendTo(mainPage);
});
