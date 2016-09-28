var composite = new tabris.Composite({
  layoutData: {top: 64, width: 200, height: 200, centerX: 0},
  transform: {translationZ: 4},
  background: 'white'
}).on('touchstart', function(widget) {
  widget.animate({transform: {translationZ: 16}}, {duration: 100});
}).on('touchend', function(widget) {
  widget.animate({transform: {translationZ: 4}}, {duration: 200});
}).appendTo(tabris.ui.contentView);

new tabris.TextView({
  text: 'Tap to elevate',
  font: 'bold 16px',
  layoutData: {centerX: 0, centerY: 0}
}).appendTo(composite);
