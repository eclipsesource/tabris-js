import {CheckBox, ColorValue, CheckBoxSelectEvent, PropertyChangedEvent, Properties, FontValue} from 'tabris';

let widget: CheckBox = new CheckBox();

// Properties
let checked: boolean;
let text: string;
let textColor: ColorValue;
let tintColor: ColorValue;
let checkedTintColor: ColorValue;
let font: FontValue;

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

let properties: Properties<typeof CheckBox> = {checked, text, textColor, tintColor, checkedTintColor, font};
widget = new CheckBox(properties);
widget.set(properties);

// Events
let target: CheckBox = widget;
let timeStamp: number = 0;
let type: string = 'foo';
let value: boolean = true;

let checkedChangedEvent: PropertyChangedEvent<CheckBox, boolean> = {target, timeStamp, type, value};
let checkBoxSelectEvent: CheckBoxSelectEvent = {target, timeStamp, type, checked};

widget
  .onCheckedChanged((event: PropertyChangedEvent<CheckBox, boolean>) => {})
  .onSelect((event: CheckBoxSelectEvent) => {});

class CustomComponent extends CheckBox {
  public foo: string;
  constructor(props: Properties<typeof CheckBox> & Partial<Pick<CustomComponent, 'foo'>>) { super(props); }
}

new CustomComponent({foo: 'bar'}).set({foo: 'bar'});
