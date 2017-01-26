var button = new tabris.Button({
  centerX: 0, top: 100,
  text: 'Native Widgets'
}).appendTo(tabris.ui.contentView);

var textView = new tabris.TextView({
  centerX: 0, top: [button, 50],
  font: '24px'
}).appendTo(tabris.ui.contentView);

button.on('select', function() {
  textView.text = 'Totally Rock!';
});
