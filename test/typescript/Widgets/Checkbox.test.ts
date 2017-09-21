import {CheckBox, Color, CheckBoxSelectEvent, PropertyChangedEvent, CheckBoxProperties} from 'tabris';

let widget: CheckBox = new CheckBox();

// Properties
let checked: boolean;
let text: string;
let textColor: Color;
let tintColor: Color;
let checkedTintColor: Color;

checked = widget.checked;
text = widget.text;
textColor = widget.textColor;
tintColor = widget.tintColor;
checkedTintColor = widget.checkedTintColor;

widget.checked = checked;
widget.text = text;
widget.textColor = textColor;
widget.tintColor = tintColor;
widget.checkedTintColor = checkedTintColor;

let properties: CheckBoxProperties = {checked, text, textColor, tintColor, checkedTintColor};
widget = new CheckBox(properties);
widget.set(properties);

// Events
let target: CheckBox = widget;
let timeStamp: number = 0;
let type: string = 'foo';
let value: boolean = true;

let checkedChangedEvent: PropertyChangedEvent<CheckBox, boolean> = {target, timeStamp, type, value};
let checkBoxSelectEvent: CheckBoxSelectEvent = {target, timeStamp, type, checked};

widget.on({
  checkedChanged: (event: PropertyChangedEvent<CheckBox, boolean>) => {},
  select: (event: CheckBoxSelectEvent) => {}
});
