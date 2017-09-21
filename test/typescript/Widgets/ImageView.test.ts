import {ImageView, Image, Color, ImageViewLoadEvent, ImageViewProperties} from 'tabris';

let widget: ImageView = new ImageView;

// Properties
let image: Image;
let scaleMode: 'auto' | 'fill' | 'fit' | 'none' | 'stretch';
let tintColor: Color;
let nullValue: null;

image = widget.image as Image;
nullValue = widget.image as null;
scaleMode = widget.scaleMode;
tintColor = widget.tintColor;

widget.image = image;
widget.image = nullValue;
widget.scaleMode = scaleMode;
widget.tintColor = tintColor;

let properties: ImageViewProperties = {image, scaleMode, tintColor};
widget = new ImageView(properties);
widget.set(properties);

// Events
let target: ImageView = widget;
let timeStamp: number = 0;
let type: string = 'foo';
let error: boolean = false;

let imageViewLoadEvent: ImageViewLoadEvent = {target, timeStamp, type, error};

widget.on({
  load: (event: ImageViewLoadEvent) => {}
});
