const {Action, NavigationView, ui} = require('tabris');
const BooksPageSelector = require('./BooksPageSelector');
const AboutPage = require('./AboutPage');

const ABOUT_ACTION_TITLE = 'About';

const navigationView = new NavigationView({
  left: 0, top: 0, right: 0, bottom: 0,
  drawerActionVisible: true
}).appendTo(ui.contentView);

ui.drawer.enabled = true;
ui.drawer.append(
  new BooksPageSelector({
    left: 0, top: 16, right: 0, bottom: 0
  })
);

new Action({
  id: 'aboutAction',
  title: ABOUT_ACTION_TITLE,
  placementPriority: 'high',
  image:  {
    src: device.platform === 'iOS' ? 'images/about-black-24dp@3x.png' : 'images/about-white-24dp@3x.png',
    scale: 3
  }
}).on('select', () => new AboutPage().appendTo(navigationView))
  .appendTo(navigationView);
