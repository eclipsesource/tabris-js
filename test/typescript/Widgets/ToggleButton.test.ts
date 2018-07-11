import {
  Color, Image, ToggleButton, PropertyChangedEvent, ToggleButtonSelectEvent, ToggleButtonProperties, Font
} from 'tabris';

let widget: ToggleButton = new ToggleButton();

// Properties
let alignment: 'center' | 'left' | 'right';
let image: Image;
let checked: boolean;
let text: string;
let textColor: Color;
let nullValue: null;
let font: Font | null;

alignment = widget.alignment;
image = widget.image as Image;
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

let properties: ToggleButtonProperties = {alignment, image, checked, text, textColor};
widget = new ToggleButton(properties);
widget.set(properties);

// Events
let target: ToggleButton = widget;
let timeStamp: number = 0;
let type: string = 'foo';
let value: boolean = true;

let checkedChangedEvent: PropertyChangedEvent<ToggleButton, boolean> = {target, timeStamp, type, value};
let toggleButtonSelectEvent: ToggleButtonSelectEvent = {target, timeStamp, type, checked};

widget.on({
  checkedChanged: (event: PropertyChangedEvent<ToggleButton, boolean>) => {},
  select: (event: ToggleButtonSelectEvent) => {},
});
