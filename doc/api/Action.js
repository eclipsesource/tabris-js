import {Action, NavigationView, contentView} from 'tabris';

const navigationView = new NavigationView({layoutData: 'stretch'})
  .appendTo(contentView);

new Action({
  title: 'Settings',
  image: 'resources/settings.png'
}).onSelect(() => console.log('Settings selected'))
  .appendTo(navigationView);
