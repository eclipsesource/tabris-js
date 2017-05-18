const {NavigationView, ui} = require('tabris');

// Create and open a page

let navigationView = new NavigationView({
  left: 0, top: 0, right: 0, bottom: 0
}).appendTo(ui.contentView);

new tabris.Page({
  title: 'Page'
}).appendTo(navigationView);
