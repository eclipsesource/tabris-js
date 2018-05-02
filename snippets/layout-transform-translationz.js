import {Composite, TextView, ui} from 'tabris';

let composite = new Composite({
  top: 64, width: 200, height: 200, centerX: 0,
  transform: {translationZ: 4},
  background: 'white'
}).on('touchStart', ({target}) => target.animate({transform: {translationZ: 16}}, {duration: 100}))
  .on('touchEnd', ({target}) => target.animate({transform: {translationZ: 4}}, {duration: 200}))
  .appendTo(ui.contentView);

new TextView({
  centerX: 0, centerY: 0,
  text: 'Tap to elevate',
  font: 'bold 16px'
}).appendTo(composite);
