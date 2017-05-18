const {ImageView, TextView, ui} = require('tabris');

let touched = 0;
new ImageView({
  centerX: 0, centerY: 0,
  image: 'images/target_200.png',
  highlightOnTouch: true
}).on('tap', () => {
  touched++;
  touchedLabel.text = 'touched ' + touched + ' times';
}).appendTo(ui.contentView);
let touchedLabel = new TextView({
  top: 'prev() 10', centerX: 0
}).appendTo(ui.contentView);
