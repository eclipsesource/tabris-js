// Create a push button that counts up on selection

var count = 0;

new tabris.Button({
  left: 10, top: 10,
  text: 'Button'
}).on('select', function() {
  this.text = 'Pressed ' + (++count) + ' times';
}).appendTo(tabris.ui.contentView);
