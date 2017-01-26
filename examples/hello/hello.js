var button = new tabris.Button({
  text: 'Native Widgets',
  layoutData: {centerX: 0, top: 100}
}).appendTo(tabris.ui.contentView);

var textView = new tabris.TextView({
  font: '24px',
  layoutData: {centerX: 0, top: [button, 50]}
}).appendTo(tabris.ui.contentView);

button.on('select', function() {
  textView.text = 'Totally Rock!';
});
