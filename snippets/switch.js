const {Button, Switch, TextView, ui} = require('tabris');

// Create a switch with a checked handler

let MARGIN = 16;

new Switch({
  left: MARGIN, top: MARGIN,
  id: 'switch',
  checked: true
}).on('checkedChanged', ({value: checked}) => {
  ui.contentView.find('#stateView').first().text = checked ? 'State: checked' : 'State: unchecked';
}).appendTo(ui.contentView);

new TextView({
  left: ['#switch', MARGIN], baseline: '#switch',
  id: 'stateView',
  text: 'State: checked'
}).appendTo(ui.contentView);

new Button({
  left: MARGIN, top: ['#switch', MARGIN],
  text: 'Toggle Switch'
}).on('select', () => {
  let switcher = ui.contentView.find('#switch').first();
  switcher.checked = !switcher.checked;
}).appendTo(ui.contentView);
