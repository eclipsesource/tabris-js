import {Button, Switch, TextView, contentView, LayoutData} from 'tabris';

// Create a switch with a checked handler

const MARGIN = 16;

new Switch({
  left: MARGIN, top: MARGIN,
  checked: true
}).onCheckedChanged(({value: checked}) => {
  contentView.find(TextView).first().text = checked ? 'State: checked' : 'State: unchecked';
}).appendTo(contentView);

new TextView({
  left: [LayoutData.prev, MARGIN], baseline: LayoutData.prev,
  text: 'State: checked'
}).appendTo(contentView);

new Button({
  left: MARGIN, top: ['Switch', MARGIN],
  text: 'Toggle Switch'
}).onSelect(() => {
  const switcher = contentView.find(Switch).first();
  switcher.checked = !switcher.checked;
}).appendTo(contentView);
