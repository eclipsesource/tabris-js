// Create a check box with a checked handler

new tabris.CheckBox({
  left: 10, top: 10,
  checked: true,
  text: 'checked'
}).on('change:checked', function(event) {
  event.target.text = event.value ? 'checked' : 'unchecked';
}).appendTo(tabris.ui.contentView);
