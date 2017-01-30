// Create and open a page

let navigationView = new tabris.NavigationView({
  left: 0, top: 0, right: 0, bottom: 0
}).appendTo(tabris.ui.contentView);

new tabris.Page({
  title: 'Page'
}).appendTo(navigationView);
