// Create a toggle button with a checked handler

new tabris.ToggleButton({
  left: 10, top: 10,
  text: 'checked',
  checked: true
}).on('checkedChanged', function(event) {
  event.target.text = event.value ? 'checked' : 'not checked';
}).appendTo(tabris.ui.contentView);
