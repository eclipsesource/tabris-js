const animationPage = require('./animation.js');
const basicPage = require('./basic.js');
const arcPage = require('./arc.js');
const textPage = require('./text.js');
const {Button, NavigationView, Page, ui} = require('tabris');

let navigationView = new NavigationView({
  left: 0, top: 0, right: 0, bottom: 0
}).appendTo(ui.contentView);

let mainPage = new Page({
  title: 'Canvas Example'
}).appendTo(navigationView);

[animationPage, basicPage, arcPage, textPage].forEach((page) => {
  new Button({
    left: 8, top: 'prev() 8', right: 8,
    text: page.title
  }).on('select', () => page.appendTo(navigationView))
    .appendTo(mainPage);
});
