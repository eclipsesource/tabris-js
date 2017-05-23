const {Action, NavigationView, ui} = require('tabris');
const BooksPageSelector = require('./BooksPageSelector');
const SettingsPage = require('./SettingsPage');

const SETTINGS_ACTION_TITLE = 'Settings';

let navigationView = new NavigationView({
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
  id: 'settingsAction',
  title: SETTINGS_ACTION_TITLE,
  placementPriority: 'high',
  image:  {
    src: device.platform === 'iOS' ? 'images/settings-black-24dp@3x.png' : 'images/settings-white-24dp@3x.png',
    scale: 3
  }
}).on('select', () => new SettingsPage().appendTo(navigationView))
  .appendTo(navigationView);
