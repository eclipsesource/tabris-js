new tabris.Button({
  centerX: 0, centerY: 0,
  text: 'Press me!'
}).on('select', function(widget) {
  widget.text = 'Please wait...';
  setTimeout(sayThanks, 2000, widget);
}).appendTo(tabris.ui.contentView);

function sayThanks(widget) {
  widget.text = 'Thank you!';
}
