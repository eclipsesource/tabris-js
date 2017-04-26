import {Button, Image} from 'tabris';

let widget: Button = new Button();

// Properties
let alignment: 'center' | 'left' | 'right';
let image: Image;
let text: string;


alignment = widget.alignment;
image = widget.image;
text = widget.text;

widget.alignment = alignment;
widget.image = image;
widget.text = text;

// Events
widget.on({
  select: event => {}
});
