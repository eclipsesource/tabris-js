import {ColorValue, RadioButton, PropertyChangedEvent, RadioButtonSelectEvent, Properties, FontValue} from 'tabris';

let widget: RadioButton = new RadioButton();

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

let properties: Properties<typeof RadioButton> = {checked, text, textColor, tintColor, checkedTintColor};
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
  constructor(props: Properties<typeof RadioButton> & Partial<Pick<CustomComponent, 'foo'>>) { super(props); }
}

new CustomComponent({foo: 'bar'}).set({foo: 'bar'});
