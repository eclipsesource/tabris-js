import {Color, RadioButton, PropertyChangedEvent, RadioButtonSelectEvent} from 'tabris';

let widget: RadioButton = new RadioButton();

// Properties
let checked: boolean;
let text: string;
let color: Color;

checked = widget.checked;
text = widget.text;
color = widget.textColor;
color = widget.tintColor;
color = widget.checkedTintColor;

widget.checked = checked;
widget.text = text;
widget.textColor = color;
widget.tintColor = color;
widget.checkedTintColor = color;

// Events
let target: RadioButton = widget;
let timeStamp: number = 0;
let type: string = 'foo';
let value: boolean = true;

let checkedChangedEvent: PropertyChangedEvent<RadioButton, boolean> = {target, timeStamp, type, value};
let radioButtonSelectEvent: RadioButtonSelectEvent = {target, timeStamp, type, checked};

widget.on({
  checkedChanged: (event: PropertyChangedEvent<RadioButton, boolean>) => {},
  select: (event: RadioButtonSelectEvent) => {}
});
