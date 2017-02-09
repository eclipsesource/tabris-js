import {ToggleButton, Image} from 'tabris';

let widget: ToggleButton;

// Properties
let alignment: 'center' | 'left' | 'right';
let image: Image;
let selection: boolean;
let text: string;

widget.alignment = alignment;
widget.image = image;
widget.selection = selection;
widget.text = text;

alignment = widget.alignment;
image = widget.image;
selection = widget.selection;
text = widget.text;
