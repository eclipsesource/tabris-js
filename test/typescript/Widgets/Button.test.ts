import {Button, Color, Image, EventObject, ButtonProperties} from 'tabris';

let widget: Button = new Button();

// Properties
let alignment: 'center' | 'left' | 'right';
let image: Image;
let text: string;
let textColor: Color;
let nullValue: null;

alignment = widget.alignment;
image = widget.image as Image;
nullValue = widget.image as null;
text = widget.text;
textColor = widget.textColor;

widget.alignment = alignment;
widget.image = image;
widget.image = nullValue;
widget.text = text;
widget.textColor = textColor;

let properties: ButtonProperties = {alignment, image, text, textColor};
widget = new Button(properties);
widget.set(properties);

// Events
let target: Button = widget;
let timeStamp: number = 0;
let type: string = 'foo';

let buttonSelectEvent: EventObject<Button> = {target, timeStamp, type};

widget.on({
  select: (event: EventObject<Button>) => {}
});
