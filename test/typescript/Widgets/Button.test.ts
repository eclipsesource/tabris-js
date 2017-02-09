import {Button, Image} from 'tabris';

let widget: Button;

// Properties
let alignment: 'center' | 'left' | 'right';
let image: Image;
let text: string;


widget.alignment = alignment;
widget.image = image;
widget.text = text;

alignment = widget.alignment;
image = widget.image;
text = widget.text;
