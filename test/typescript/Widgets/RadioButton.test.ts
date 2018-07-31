import {Color, RadioButton, PropertyChangedEvent, RadioButtonSelectEvent, RadioButtonProperties, Font, Properties} from 'tabris';

let widget: RadioButton = new RadioButton();

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

let properties: RadioButtonProperties = {checked, text, textColor, tintColor, checkedTintColor};
widget = new RadioButton(properties);
widget.set(properties);

// Events
let target: RadioButton = widget;
let timeStamp: number = 0;
let type: string = 'foo';
let value: boolean = true;

let checkedChangedEvent: PropertyChangedEvent<RadioButton, boolean> = {target, timeStamp, type, value};
let radioButtonSelectEvent: RadioButtonSelectEvent = {target, timeStamp, type, checked};

widget
  .onCheckedChanged((event: PropertyChangedEvent<RadioButton, boolean>) => {})
  .onSelect((event: RadioButtonSelectEvent) => {});

class CustomComponent extends RadioButton {
  public foo: string;
  constructor(props: Properties<CustomComponent>) { super(props); }
}

new CustomComponent({foo: 'bar'}).set({foo: 'bar'});
