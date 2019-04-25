import {Action, NavigationView, contentView, device} from 'tabris';

const navigationView = new NavigationView({
  left: 0, top: 0, right: 0, bottom: 0
}).appendTo(contentView);

createAction('Close', getImage('close'), 'navigation');
createAction('Settings', getImage('settings'), 'default');
createAction('Share', getImage('share'), 'overflow');

function createAction(title, image, placement) {
  new Action({
    title,
    placement,
    image: {src: image, scale: 3}
  }).appendTo(navigationView);
}

function getImage(image) {
  return 'resources/' + image + (device.platform === 'iOS' ? '-black-24dp@3x.png' : '-white-24dp@3x.png');
}
