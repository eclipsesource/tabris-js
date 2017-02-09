import {ImageView, Image, Color} from 'tabris';

let widget: ImageView;

// Properties
let image: Image;
let scaleMode: 'auto' | 'fill' | 'fit' | 'none' | 'stretch';
let tintColor: Color;

widget.image = image;
widget.scaleMode = scaleMode;
widget.tintColor = tintColor;

image = widget.image;
scaleMode = widget.scaleMode;
tintColor = widget.tintColor;
