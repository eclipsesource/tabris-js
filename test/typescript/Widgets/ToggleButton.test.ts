import {Color, Image, ToggleButton} from 'tabris';

let widget: ToggleButton = new ToggleButton();

// Properties
let alignment: 'center' | 'left' | 'right';
let image: Image;
let checked: boolean;
let text: string;
let textColor: Color;

alignment = widget.alignment;
image = widget.image;
checked = widget.checked;
text = widget.text;
textColor = widget.textColor;

widget.alignment = alignment;
widget.image = image;
widget.checked = checked;
widget.text = text;
widget.textColor = textColor;

// Events
widget.on({
  checkedChanged: event => checked = event.value,
  select: event => checked = event.checked
});
