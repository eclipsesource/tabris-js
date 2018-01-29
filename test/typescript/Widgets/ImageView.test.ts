import {ImageView, Image, Color, ImageViewLoadEvent, ImageViewZoomEvent, ImageViewProperties, PropertyChangedEvent} from 'tabris';

let widget: ImageView = new ImageView;

// Properties
let image: Image;
let scaleMode: 'auto' | 'fill' | 'fit' | 'none' | 'stretch';
let tintColor: Color;
let nullValue: null;
let zoomEnabled: boolean;
let zoomLevel: number;
let minZoomLevel: number;
let maxZoomLevel: number;

image = widget.image as Image;
nullValue = widget.image as null;
scaleMode = widget.scaleMode;
tintColor = widget.tintColor;
zoomEnabled = widget.zoomEnabled;
zoomLevel = widget.zoomLevel;
minZoomLevel = widget.minZoomLevel;
maxZoomLevel = widget.maxZoomLevel;

widget.image = image;
widget.image = nullValue;
widget.scaleMode = scaleMode;
widget.tintColor = tintColor;
widget.zoomEnabled = zoomEnabled;
widget.zoomLevel = zoomLevel;
widget.minZoomLevel = minZoomLevel;
widget.maxZoomLevel = maxZoomLevel;

let properties: ImageViewProperties = {image, scaleMode, tintColor, zoomEnabled, zoomLevel, minZoomLevel, maxZoomLevel};
widget = new ImageView(properties);
widget.set(properties);

// Events
let target: ImageView = widget;
let timeStamp: number = 0;
let type: string = 'foo';
let error: boolean = false;
let value: number = 0;

let imageViewLoadEvent: ImageViewLoadEvent = {target, timeStamp, type, error};
let imageViewZoomLevelChangedEvent: PropertyChangedEvent<ImageView, number> = {target, timeStamp, type, value};
let imageViewZoomEvent: ImageViewZoomEvent = {target, timeStamp, type, zoomLevel};


widget.on({
  load: (event: ImageViewLoadEvent) => {},
  zoomLevelChanged: (event: PropertyChangedEvent<ImageView, number>) => {},
  zoom: (event: ImageViewZoomEvent) => {}
});
