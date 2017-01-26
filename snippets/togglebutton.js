// Create a toggle button with a selection handler

new tabris.ToggleButton({
  left: 10, top: 10,
  text: 'selected',
  selection: true
}).on('change:selection', function(button, selection) {
  this.text = selection ? 'selected' : 'not selected';
}).appendTo(tabris.ui.contentView);
