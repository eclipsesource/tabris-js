var composite = new tabris.Composite({
  top: 64, width: 200, height: 200, centerX: 0,
  transform: {translationZ: 4},
  background: 'white'
}).on('touchstart', function({target}) {
  target.animate({transform: {translationZ: 16}}, {duration: 100});
}).on('touchend', function({target}) {
  target.animate({transform: {translationZ: 4}}, {duration: 200});
}).appendTo(tabris.ui.contentView);

new tabris.TextView({
  centerX: 0, centerY: 0,
  text: 'Tap to elevate',
  font: 'bold 16px'
}).appendTo(composite);
