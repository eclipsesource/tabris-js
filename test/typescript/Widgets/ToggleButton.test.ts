import {
  ColorValue, ImageValue, ToggleButton, PropertyChangedEvent, ToggleButtonSelectEvent, Properties, FontValue
} from 'tabris';

let widget: ToggleButton = new ToggleButton();

// Properties
let alignment: 'center' | 'left' | 'right';
let image: ImageValue;
let checked: boolean;
let text: string;
let textColor: ColorValue;
let nullValue: null;
let font: FontValue;

alignment = widget.alignment;
image = widget.image as ImageValue;
nullValue = widget.image as null;
text = widget.text;
textColor = widget.textColor;
checked = widget.checked;
font = widget.font;

widget.alignment = alignment;
widget.image = image;
widget.image = nullValue;
widget.checked = checked;
widget.text = text;
widget.textColor = textColor;
widget.font = font;

let properties: Properties<ToggleButton> = {alignment, image, checked, text, textColor};
widget = new ToggleButton(properties);
widget.set(properties);

// Events
let target: ToggleButton = widget;
let timeStamp: number = 0;
let type: string = 'foo';
let value: boolean = true;

let checkedChangedEvent: PropertyChangedEvent<ToggleButton, boolean> = {target, timeStamp, type, value};
let toggleButtonSelectEvent: ToggleButtonSelectEvent = {target, timeStamp, type, checked};

widget
  .onCheckedChanged((event: PropertyChangedEvent<ToggleButton, boolean>) => {})
  .onSelect((event: ToggleButtonSelectEvent) => {});

class CustomComponent extends ToggleButton {
  public foo: string;
  constructor(props: Properties<ToggleButton> & Partial<Pick<CustomComponent, 'foo'>>) { super(props); }
}

new CustomComponent({foo: 'bar'}).set({foo: 'bar'});
