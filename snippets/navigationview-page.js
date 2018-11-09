import {NavigationView, Page, ui} from 'tabris';

// Create and open a page

const navigationView = new NavigationView({
  left: 0, top: 0, right: 0, bottom: 0
}).appendTo(ui.contentView);

new Page({
  title: 'Page'
}).appendTo(navigationView);
