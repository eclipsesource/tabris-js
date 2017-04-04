import {ToggleButton, Image} from 'tabris';

let widget: ToggleButton = new ToggleButton();

// Properties
let alignment: 'center' | 'left' | 'right';
let image: Image;
let checked: boolean;
let text: string;

alignment = widget.alignment;
image = widget.image;
checked = widget.checked;
text = widget.text;

widget.alignment = alignment;
widget.image = image;
widget.checked = checked;
widget.text = text;
