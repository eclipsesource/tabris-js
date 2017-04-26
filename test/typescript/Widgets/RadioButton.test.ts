import {RadioButton} from 'tabris';

let widget: RadioButton = new RadioButton();

// Properties
let checked: boolean;
let text: string;

checked = widget.checked;
text = widget.text;

widget.checked = checked;
widget.text = text;

// Events
widget.on({
  checkedChanged: event => checked = event.value,
  select: event => checked = event.checked
});
