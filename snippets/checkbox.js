new tabris.CheckBox({
  layoutData: {left: 10, top: 10},
  selection: true,
  text: 'selected'
}).on('change:selection', function(checkBox, selection) {
  this.set('text', selection ? 'selected' : 'deselected');
}).appendTo(tabris.ui.contentView);
