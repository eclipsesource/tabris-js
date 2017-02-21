import {CheckBox} from 'tabris';

let widget: CheckBox;

// Properties
let checked: boolean;
let text: string;

widget.checked = checked;
widget.text = text;

checked = widget.checked;
text = widget.text;

// Events

widget.on('change:checked', (event) => {
  let self: CheckBox = event.target;
  let checked: boolean = event.value;
});
