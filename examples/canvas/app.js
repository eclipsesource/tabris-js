var MARGIN = 8;

var navigationView = new tabris.NavigationView({
  left: 0, top: 0, right: 0, bottom: 0
}).appendTo(tabris.ui.contentView);

var animationPage = require('./animation.js');
var basicPage = require('./basic.js');
var arcPage = require('./arc.js');
var textPage = require('./text.js');

var mainPage = new tabris.Page({
  title: 'Canvas Example'
}).appendTo(navigationView);


[animationPage, basicPage, arcPage, textPage].forEach(function(page) {
  new tabris.Button({
    left: MARGIN, top: ['prev()', MARGIN],
    text: page.title
  }).on('select', function() {
    page.appendTo(navigationView);
  }).appendTo(mainPage);
});

