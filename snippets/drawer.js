import {TextView, ui} from 'tabris';

// Enable the drawer and append a widget to it

const drawer = ui.drawer;

drawer.enabled = true;

drawer.on('open', () => console.log('drawer opened'))
  .on('close', () => console.log('drawer closed'));

const arrow = String.fromCharCode(8592);
createLabel(arrow + ' Swipe from left or tap here')
  .on('tap', () => drawer.open())
  .appendTo(ui.contentView);

createLabel('Thank you!')
  .on('tap', () => drawer.close())
  .appendTo(drawer);

function createLabel(text) {
  return new TextView({
    left: 10, centerY: 0,
    text,
    font: '22px Arial'
  });
}
