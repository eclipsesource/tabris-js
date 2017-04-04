import {ImageView, Image, Color} from 'tabris';

let widget: ImageView = new ImageView;

// Properties
let image: Image;
let scaleMode: 'auto' | 'fill' | 'fit' | 'none' | 'stretch';
let tintColor: Color;

image = widget.image;
scaleMode = widget.scaleMode;
tintColor = widget.tintColor;

widget.image = image;
widget.scaleMode = scaleMode;
widget.tintColor = tintColor;
