import {Widget,
 Color,
 Image,
 margin,
 Bounds,
 offset,
 Font,
 dimension,
 LayoutData,
 Transformation,
 AnimationOptions,
 Selector,
 WidgetCollection,
 Composite
} from 'tabris';

let widget: Widget = new Composite();

// Properties
let background: Color;
let backgroundImage: Image;
let baseline: Widget;
let bottom: margin;
let bounds: Bounds;
let centerX: offset;
let centerY: offset;
let _class: string;
let classList: string[];
let cornerRadius: number;
let elevation: number;
let enabled: boolean;
let font: Font;
let height: dimension;
let highlightOnTouch: boolean;
let id: string;
let layoutData: LayoutData;
let left: margin;
let opacity: number;
let right: margin;
let textColor: Color;
let top: margin;
let transform: Transformation;
let visible: boolean;
let width: dimension;

background = widget.background;
backgroundImage = widget.backgroundImage;
baseline = widget.baseline;
bottom = widget.bottom;
bounds = widget.bounds;
centerX = widget.centerX;
centerY = widget.centerY;
_class = widget.class;
classList = widget.classList;
cornerRadius = widget.cornerRadius;
elevation = widget.elevation;
enabled = widget.enabled;
font = widget.font;
height = widget.height;
highlightOnTouch = widget.highlightOnTouch;
id = widget.id;
layoutData = widget.layoutData;
left = widget.left;
opacity = widget.opacity;
right = widget.right;
textColor = widget.textColor;
top = widget.top;
transform = widget.transform;
visible = widget.visible;
width = widget.width;

widget.background = background;
widget.backgroundImage = backgroundImage;
widget.baseline = baseline;
widget.bottom = bottom;
widget.centerX = centerX;
widget.centerY = centerY;
widget.class = _class;
widget.classList = classList;
widget.cornerRadius = cornerRadius;
widget.elevation = elevation;
widget.enabled = enabled;
widget.font = font;
widget.height = height;
widget.highlightOnTouch = highlightOnTouch;
widget.id = id;
widget.layoutData = layoutData;
widget.left = left;
widget.opacity = opacity;
widget.right = right;
widget.textColor = textColor;
widget.top = top;
widget.transform = transform;
widget.visible = visible;
widget.width = width;

// Methods
let properties: {transform?: Transformation, opacity?: number} = {};
let parent: Composite = new Composite();
let options: AnimationOptions = {};
let selector: Selector = '';
let otherWidget: Widget = new Composite();
let promise: Promise<any>;
let thisReturnValue: Widget;
let voidReturnValue: void;
let widgetCollection: WidgetCollection;
let bool: boolean;
let composite: Composite;

promise = widget.animate(properties, options);
thisReturnValue = widget.appendTo(parent);
thisReturnValue = widget.apply(properties);
widgetCollection = widget.children();
widgetCollection = widget.children(selector);
thisReturnValue = widget.detach();
voidReturnValue = widget.dispose();
widgetCollection = widget.find();
widgetCollection = widget.find(selector);
thisReturnValue = widget.insertAfter(otherWidget);
thisReturnValue = widget.insertBefore(otherWidget);
bool = widget.isDisposed();
composite = widget.parent();
widgetCollection = widget.siblings();
widgetCollection = widget.siblings(selector);

// Events
let state: 'start'|'change'|'end'|'cancel';
let touches: {x: number, y: number}[];
let absTouches: {x: number, y: number, absoluteX: number, absoluteY: number}[];
let isNumber: number;
widget.on({
  dispose: event => {},
  resize: event => {
    isNumber = event.height;
    isNumber = event.width;
    isNumber = event.top;
    isNumber = event.left;
  },
  swipeDown: event => touches = event.touches,
  swipeLeft: event => touches = event.touches,
  swipeRight: event => touches = event.touches,
  swipeUp: event => touches = event.touches,
  touchCancel: event => absTouches = event.touches,
  touchEnd: event => absTouches = event.touches,
  touchMove: event => absTouches = event.touches,
  touchStart: event => absTouches = event.touches,
  tap: event => touches = event.touches,
  longpress: event => {
    state = event.state;
    touches = event.touches;
  },
  pan: event => {
    state = event.state;
    touches = event.touches;
    isNumber = event.translationX;
    isNumber = event.translationY;
    isNumber = event.velocityX;
    isNumber = event.velocityY;
  },
  panDown: event => {
    state = event.state;
    touches = event.touches;
    isNumber = event.translationX;
    isNumber = event.translationY;
    isNumber = event.velocityX;
    isNumber = event.velocityY;
  },
  panHorizontal: event => {
    state = event.state;
    touches = event.touches;
    isNumber = event.translationX;
    isNumber = event.translationY;
    isNumber = event.velocityX;
    isNumber = event.velocityY;
  },
  panLeft: event => {
    state = event.state;
    touches = event.touches;
    isNumber = event.translationX;
    isNumber = event.translationY;
    isNumber = event.velocityX;
    isNumber = event.velocityY;
  },
  panRight: event => {
    state = event.state;
    touches = event.touches;
    isNumber = event.translationX;
    isNumber = event.translationY;
    isNumber = event.velocityX;
    isNumber = event.velocityY;
  },
  panUp: event => {
    state = event.state;
    touches = event.touches;
    isNumber = event.translationX;
    isNumber = event.translationY;
    isNumber = event.velocityX;
    isNumber = event.velocityY;
  },
  panVertical: event => {
    state = event.state;
    touches = event.touches;
    isNumber = event.translationX;
    isNumber = event.translationY;
    isNumber = event.velocityX;
    isNumber = event.velocityY;
  }
});
