// Create a check box with a selection handler

new tabris.CheckBox({
  left: 10, top: 10,
  selection: true,
  text: 'selected'
}).on('change:selection', function(checkBox, selection) {
  this.text = selection ? 'selected' : 'deselected';
}).appendTo(tabris.ui.contentView);
