import {CheckBox, Color} from 'tabris';

let widget: CheckBox = new CheckBox();

// Properties
let checked: boolean;
let text: string;
let color: Color;

checked = widget.checked;
text = widget.text;
color = widget.textColor;
color = widget.tintColor;

widget.checked = checked;
widget.text = text;
widget.textColor = color;
widget.tintColor = color;

// Events
widget.on({
  checkedChanged: event => checked = event.value,
  select: event => checked = event.checked
});
