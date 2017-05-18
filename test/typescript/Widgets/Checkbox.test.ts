import {CheckBox, Color} from 'tabris';

let widget: CheckBox = new CheckBox();

// Properties
let checked: boolean;
let text: string;
let textColor: Color;

checked = widget.checked;
text = widget.text;
textColor = widget.textColor;

widget.checked = checked;
widget.text = text;
widget.textColor = textColor;

// Events
widget.on({
  checkedChanged: event => checked = event.value,
  select: event => checked = event.checked
});
