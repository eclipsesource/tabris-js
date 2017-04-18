// Create a switch with a checked handler

var MARGIN = 16;

new tabris.Switch({
  left: MARGIN, top: MARGIN,
  id: 'switch',
  checked: true
}).on('checkedChanged', function({value: checked}) {
  tabris.ui.contentView.find('#stateView').first().text = checked ? 'State: checked' : 'State: unchecked';
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
  var switcher = tabris.ui.contentView.find('#switch').first();
  switcher.checked = !switcher.checked;
}).appendTo(tabris.ui.contentView);
