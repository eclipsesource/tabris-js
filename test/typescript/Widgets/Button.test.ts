import {Button, Color, Image} from 'tabris';

let widget: Button = new Button();

// Properties
let alignment: 'center' | 'left' | 'right';
let image: Image;
let text: string;
let textColor: Color;

alignment = widget.alignment;
image = widget.image;
text = widget.text;
text = widget.text;
textColor = widget.textColor;

widget.alignment = alignment;
widget.image = image;
widget.text = text;
widget.text = text;
widget.textColor = textColor;

// Events
widget.on({
  select: event => {}
});
