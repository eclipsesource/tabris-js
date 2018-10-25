import {Widget,
  ColorValue,
  ConstraintValue,
  Bounds,
  Offset,
  Dimension,
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
  PropertyChangedEvent,
  Properties,
  ImageValue,
  SiblingReferenceValue,
  LayoutDataValue
 } from 'tabris';

 let widget: Widget = new Composite();

// Properties
let background: ColorValue;
let backgroundImage: ImageValue;
let baseline: SiblingReferenceValue|'auto';
let bottomMargin: ConstraintValue|'auto';
let bounds: Bounds;
let centerX: Offset|'auto';
let centerY: Offset|'auto';
let _class: string;
let classList: string[];
let cornerRadius: number;
let elevation: number;
let enabled: boolean;
let height: Dimension|'auto';
let highlightOnTouch: boolean;
let id: string;
let layoutData: LayoutDataValue;
let leftMargin: ConstraintValue;
let opacity: number;
let rightMargin: ConstraintValue;
let topMargin: ConstraintValue;
let transform: Transformation;
let visible: boolean;
let width: Dimension|'auto';
let data: object;
let leftOffset: number = 0;
let topOffset: number  = 0;
background = widget.background;
backgroundImage = widget.backgroundImage;
baseline = widget.baseline;
bottomMargin = widget.bottom;
bounds = widget.bounds;
centerX = widget.centerX;
centerY = widget.centerY;
_class = widget.class;
classList = widget.classList;
cornerRadius = widget.cornerRadius;
elevation = widget.elevation;
enabled = widget.enabled;
height = widget.height;
highlightOnTouch = widget.highlightOnTouch;
id = widget.id;
layoutData = widget.layoutData;
leftMargin = widget.left;
opacity = widget.opacity;
rightMargin = widget.right;
topMargin = widget.top;
transform = widget.transform;
visible = widget.visible;
width = widget.width;
data = widget.data;
widget.background = background;
widget.backgroundImage = backgroundImage;
widget.baseline = baseline;
widget.bottom = bottomMargin;
widget.centerX = centerX;
widget.centerY = centerY;
widget.class = _class;
widget.classList = classList;
widget.data.foo = 42;
widget.cornerRadius = cornerRadius;
widget.elevation = elevation;
widget.enabled = enabled;
widget.height = height;
widget.highlightOnTouch = highlightOnTouch;
widget.id = id;
widget.layoutData = layoutData;
widget.left = leftMargin;
widget.opacity = opacity;
widget.right = rightMargin;
widget.top = topMargin;
widget.transform = transform;
widget.visible = visible;
widget.width = width;
let properties: Properties<Widget> = {
  background,
  backgroundImage,
  baseline,
  bottom: bottomMargin,
  centerX,
  centerY,
  class: _class,
  classList,
  cornerRadius,
  elevation,
  enabled,
  height,
  highlightOnTouch,
  id,
  layoutData,
  left: leftMargin,
  opacity,
  right: rightMargin,
  top: topMargin,
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
thisReturnValue = widget.detach();
voidReturnValue = widget.dispose();
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
let resizeEvent: WidgetResizeEvent = {target, timeStamp, type, height: 0, left: leftOffset, top: topOffset, width: 0};
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
widget
  .onDispose((event: EventObject<Widget>) => {})
  .onResize((event: WidgetResizeEvent) => {})
  .onBoundsChanged((event: PropertyChangedEvent<Widget, Bounds>) => {})
  .onIdChanged((event: PropertyChangedEvent<Widget, string>) => {})
  .onSwipeDown((event: WidgetSwipeEvent) => {})
  .onSwipeLeft((event: WidgetSwipeEvent) => {})
  .onSwipeRight((event: WidgetSwipeEvent) => {})
  .onSwipeUp((event: WidgetSwipeEvent) => {})
  .onTouchCancel((event: WidgetTouchEvent) => {})
  .onTouchEnd((event: WidgetTouchEvent) => {})
  .onTouchMove((event: WidgetTouchEvent) => {})
  .onTouchStart((event: WidgetTouchEvent) => {})
  .onTap((event: WidgetTapEvent) => {})
  .onLongpress((event: WidgetLongpressEvent) => {})
  .onPan((event: WidgetPanEvent) => {})
  .onPanDown((event: WidgetPanEvent) => {})
  .onPanHorizontal((event: WidgetPanEvent) => {})
  .onPanLeft((event: WidgetPanEvent) => {})
  .onPanRight((event: WidgetPanEvent) => {})
  .onPanUp((event: WidgetPanEvent) => {})
  .onPanVertical((event: WidgetPanEvent) => {});
widget.set({noKnownProperty: 12});
