import {Action, NavigationView, Page, Popover, Button, TextView, contentView, device} from 'tabris';

const button = new Button({
  left: 16, right: 16, top: 24,
  text: 'Show Popover'
}).on('select', showPopover)
  .appendTo(contentView);

function showPopover() {
  const popover = new Popover({width: 300, height: 400, anchor: button})
    .on('close', () => console.log('Popover closed'))
    .open();
  const navigationView = new NavigationView({
    layoutData: {left: 0, right: 0, top: 0, bottom: 0},
    navigationAction: new Action({
      title: 'Close',
      image: {
        src: device.platform === 'iOS' ? 'resources/close-black-24dp@3x.png' : 'resources/close-white-24dp@3x.png',
        scale: 3
      }
    }).on('select', () => popover.close())
  }).appendTo(popover.contentView);
  const page = new Page({title: 'Popover'}).appendTo(navigationView);
  new TextView({centerX: 0, centerY: 0, text: 'Hello popover'}).appendTo(page);
}
