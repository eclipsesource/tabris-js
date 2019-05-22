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
 Composite,
 EventObject,
 WidgetResizeEvent,
 WidgetSwipeEvent,
 WidgetTouchEvent,
 WidgetTapEvent,
 WidgetLongpressEvent,
 WidgetPanEvent,
 WidgetProperties
} from 'tabris';

let widget: Widget = new Composite();

// Properties
let background: Color;
let backgroundImage: Image;
let baseline: Widget | Selector;
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
let top: margin;
let transform: Transformation;
let visible: boolean;
let width: dimension;
let data: any;
let nullValue: null;

background = widget.background;
backgroundImage = widget.backgroundImage;
baseline = widget.baseline;
bottom = widget.bottom;
bounds = widget.bounds;
bounds = widget.absoluteBounds;
centerX = widget.centerX;
centerY = widget.centerY;
_class = widget.class;
classList = widget.classList;
cornerRadius = widget.cornerRadius;
elevation = widget.elevation;
enabled = widget.enabled;
font = widget.font as Font;
nullValue = widget.font as null;
height = widget.height;
highlightOnTouch = widget.highlightOnTouch;
id = widget.id;
layoutData = widget.layoutData;
left = widget.left;
opacity = widget.opacity;
right = widget.right;
top = widget.top;
transform = widget.transform;
visible = widget.visible;
width = widget.width;
data = widget.data;

widget.background = background;
widget.backgroundImage = backgroundImage;
widget.baseline = baseline;
widget.bottom = bottom;
widget.centerX = centerX;
widget.centerY = centerY;
widget.class = _class;
widget.classList = classList;
widget.data.foo = 42;
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
widget.top = top;
widget.transform = transform;
widget.visible = visible;
widget.width = width;

let properties: WidgetProperties = {
  background,
  backgroundImage,
  baseline,
  bottom,
  centerX,
  centerY,
  class: _class,
  classList,
  cornerRadius,
  elevation,
  enabled,
  font,
  height,
  highlightOnTouch,
  id,
  layoutData,
  left,
  opacity,
  right,
  top,
  transform,
  visible,
  width
};
widget.set(properties);

// Methods
class Foo extends Composite {}
let fooCollection: WidgetCollection<Widget>;
let widgetCollection: WidgetCollection<Widget>;
let animationProperties: {transform?: Transformation, opacity?: number} = {};
let parent: Composite = new Composite();
let options: AnimationOptions = {};
let selector: Selector = '';
let otherWidget: Widget = new Composite();
let promise: Promise<Widget>;
let thisReturnValue: Widget;
let voidReturnValue: void;
let bool: boolean;
let composite: Composite;

promise = widget.animate(animationProperties, options);
thisReturnValue = widget.appendTo(parent);
thisReturnValue = widget.apply({'selectorString': properties});
widgetCollection = widget.children();
widgetCollection = widget.children(selector);
fooCollection = widget.children(Foo);
thisReturnValue = widget.detach();
voidReturnValue = widget.dispose();
widgetCollection = widget.find();
widgetCollection = widget.find(selector);
fooCollection = widget.find(Foo);
thisReturnValue = widget.insertAfter(otherWidget);
thisReturnValue = widget.insertBefore(otherWidget);
bool = widget.isDisposed();
composite = widget.parent();
widgetCollection = widget.siblings();
widgetCollection = widget.siblings(selector);
fooCollection = widget.siblings(Foo);

// Events
let target: Widget = widget;
let timeStamp: number = 0;
let type: string = 'foo';
let state: 'start'|'change'|'end'|'cancel' = 'start';
let touches: {x: number, y: number}[] = [];
let absTouches: {x: number, y: number, absoluteX: number, absoluteY: number}[] = [];
let translationX: number = 0;
let translationY: number = 0;
let velocityX: number = 0;
let velocityY: number = 0;

let disposeEvent: EventObject<Widget> = {target, timeStamp, type};
let resizeEvent: WidgetResizeEvent = {target, timeStamp, type, height, left, top, width};
let swipeDownEvent: WidgetSwipeEvent = {target, timeStamp, type, touches};
let swipeLeftEvent: WidgetSwipeEvent = {target, timeStamp, type, touches};
let swipeRightEvent: WidgetSwipeEvent = {target, timeStamp, type, touches};
let swipeUpEvent: WidgetSwipeEvent = {target, timeStamp, type, touches};
let touchCancelEvent: WidgetTouchEvent = {target, timeStamp, type, touches: absTouches};
let touchEndEvent: WidgetTouchEvent = {target, timeStamp, type, touches: absTouches};
let touchMoveEvent: WidgetTouchEvent = {target, timeStamp, type, touches: absTouches};
let touchStartEvent: WidgetTouchEvent = {target, timeStamp, type, touches: absTouches};
let tapEvent: WidgetTapEvent = {target, timeStamp, type, touches};
let longpressEvent: WidgetLongpressEvent = {target, timeStamp, type, state, touches};
let panEvent: WidgetPanEvent = {
  target, timeStamp, type, state, touches, translationX, translationY, velocityX, velocityY
};
let panDownEvent: WidgetPanEvent = {
  target, timeStamp, type, state, touches, translationX, translationY, velocityX, velocityY
};
let panHorizontalEvent: WidgetPanEvent = {
  target, timeStamp, type, state, touches, translationX, translationY, velocityX, velocityY
};
let panLeftEvent: WidgetPanEvent = {
  target, timeStamp, type, state, touches, translationX, translationY, velocityX, velocityY
};
let panRightEvent: WidgetPanEvent = {
  target, timeStamp, type, state, touches, translationX, translationY, velocityX, velocityY
};
let panUpEvent: WidgetPanEvent = {
  target, timeStamp, type, state, touches, translationX, translationY, velocityX, velocityY
};
let panVerticalEvent: WidgetPanEvent = {
  target, timeStamp, type, state, touches, translationX, translationY, velocityX, velocityY
};


widget.on({
  dispose: (event: EventObject<Widget>) => {},
  resize: (event: WidgetResizeEvent) => {},
  swipeDown: (event: WidgetSwipeEvent) => {},
  swipeLeft: (event: WidgetSwipeEvent) => {},
  swipeRight: (event: WidgetSwipeEvent) => {},
  swipeUp: (event: WidgetSwipeEvent) => {},
  touchCancel: (event: WidgetTouchEvent) => {},
  touchEnd: (event: WidgetTouchEvent) => {},
  touchMove: (event: WidgetTouchEvent) => {},
  touchStart: (event: WidgetTouchEvent) => {},
  tap: (event: WidgetTapEvent) => {},
  longpress: (event: WidgetLongpressEvent) => {},
  pan: (event: WidgetPanEvent) => {},
  panDown: (event: WidgetPanEvent) => {},
  panHorizontal: (event: WidgetPanEvent) => {},
  panLeft: (event: WidgetPanEvent) => {},
  panRight: (event: WidgetPanEvent) => {},
  panUp: (event: WidgetPanEvent) => {},
  panVertical: (event: WidgetPanEvent) => {}
});
