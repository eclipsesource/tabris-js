var touched = 0;
new tabris.ImageView({
  centerX: 0, centerY: 0,
  image: 'images/target_200.png',
  highlightOnTouch: true
}).on('tap', function() {
  touched++;
  touchedLabel.text = 'touched ' + touched + ' times';
}).appendTo(tabris.ui.contentView);
var touchedLabel = new tabris.TextView({
  top: 'prev() 10', centerX: 0
}).appendTo(tabris.ui.contentView);
