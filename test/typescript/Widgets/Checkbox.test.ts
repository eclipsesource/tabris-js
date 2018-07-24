import {CheckBox, Color, CheckBoxSelectEvent, PropertyChangedEvent, CheckBoxProperties, Font, Properties} from 'tabris';

let widget: CheckBox = new CheckBox();

// Properties
let checked: boolean;
let text: string;
let textColor: Color;
let tintColor: Color;
let checkedTintColor: Color;
let font: Font | null;

checked = widget.checked;
text = widget.text;
textColor = widget.textColor;
tintColor = widget.tintColor;
checkedTintColor = widget.checkedTintColor;
font = widget.font;

widget.checked = checked;
widget.text = text;
widget.textColor = textColor;
widget.tintColor = tintColor;
widget.checkedTintColor = checkedTintColor;
widget.font = font;

let properties: CheckBoxProperties = {checked, text, textColor, tintColor, checkedTintColor, font};
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

class CustomComponent extends CheckBox {
  public foo: string;
  constructor(props: Properties<CustomComponent>) { super(props); }
}

new CustomComponent({foo: 'bar'}).set({foo: 'bar'});
