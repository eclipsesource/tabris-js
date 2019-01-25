import {Button, Switch, TextView, contentView} from 'tabris';

// Create a switch with a checked handler

const MARGIN = 16;

new Switch({
  left: MARGIN, top: MARGIN,
  id: 'switch',
  checked: true
}).on('checkedChanged', ({value: checked}) => {
  contentView.find('#stateView').first().text = checked ? 'State: checked' : 'State: unchecked';
}).appendTo(contentView);

new TextView({
  left: ['#switch', MARGIN], baseline: '#switch',
  id: 'stateView',
  text: 'State: checked'
}).appendTo(contentView);

new Button({
  left: MARGIN, top: ['#switch', MARGIN],
  text: 'Toggle Switch'
}).on('select', () => {
  const switcher = contentView.find('#switch').first();
  switcher.checked = !switcher.checked;
}).appendTo(contentView);
