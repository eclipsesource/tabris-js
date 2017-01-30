var timer = new tabris.InactivityTimer({
  delay: 2000
}).on('timeout', function() {
  label.text = 'inactive!';
});

var label = new tabris.TextView({
  centerX: 0, top: 16,
  text: ''
}).appendTo(tabris.ui.contentView);

new tabris.Button({
  centerX: 0, top: 'prev()',
  text: 'Start'
}).on('select', function() {
  timer.start();
  label.text = 'started';
}).appendTo(tabris.ui.contentView);

new tabris.Button({
  centerX: 0, top: 'prev()',
  text: 'Cancel'
}).on('select', function() {
  timer.cancel();
  label.text = 'cancelled';
}).appendTo(tabris.ui.contentView);
