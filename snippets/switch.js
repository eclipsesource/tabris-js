// Create a switch with a selection handler

var MARGIN = 16;

new tabris.Switch({
  left: MARGIN, top: MARGIN,
  id: 'switch',
  selection: true
}).on('change:selection', function(widget, selection) {
  tabris.ui.contentView.find('#stateView').first().text = selection ? 'State: checked' : 'State: unchecked';
}).appendTo(tabris.ui.contentView);

new tabris.TextView({
  left: ['#switch', MARGIN], baseline: '#switch',
  id: 'stateView',
  text: 'State: checked'
}).appendTo(tabris.ui.contentView);

new tabris.Button({
  left: MARGIN, top: ['#switch', MARGIN],
  text: 'Toggle Switch'
}).on('select', function() {
  var checked = tabris.ui.contentView.find('#switch').first().selection;
  tabris.ui.contentView.find('#switch').first().selection = !checked;
}).appendTo(tabris.ui.contentView);
