import {Composite, TextView, contentView} from 'tabris';

const composite = new Composite({
  top: 64, width: 200, height: 200, centerX: 0,
  transform: {translationZ: 4},
  background: 'white'
}).onTouchStart(({target}) => target.animate({transform: {translationZ: 16}}, {duration: 100}))
  .onTouchEnd(({target}) => target.animate({transform: {translationZ: 4}}, {duration: 200}))
  .appendTo(contentView);

new TextView({
  centerX: 0, centerY: 0,
  text: 'Tap to elevate',
  font: 'bold 16px'
}).appendTo(composite);
