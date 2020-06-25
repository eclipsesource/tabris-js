import {
  Widget,
  TabFolder,
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
  WidgetLongPressEvent,
  WidgetPanEvent,
  PropertyChangedEvent,
  Properties,
  ImageValue,
  SiblingReferenceValue,
  LayoutDataValue,
  LinearGradientValue,
  BoxDimensions
 } from 'tabris';

const widget: Widget = new Composite();

// Properties
let background: ColorValue | LinearGradientValue | ImageValue;
let backgroundColor: ColorValue = '#fff';
let backgroundImage: ImageValue = {src: 'foo'};
let backgroundGradient: LinearGradientValue = 'linergradient';
let baseline: SiblingReferenceValue|'auto'|true;
let bottomMargin: ConstraintValue|'auto';
let bounds: Bounds;
let boxDim: BoxDimensions|number|null;
let centerX: Offset|true|'auto';
let centerY: Offset|true|'auto';
let _class: string;
let classList: string[];
let cornerRadius: number;
let elevation: number;
let enabled: boolean;
let excludeFromLayout: boolean;
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
const leftOffset: number = 0;
const topOffset: number  = 0;
background = widget.background;
backgroundColor = widget.background as ColorValue;
backgroundImage = widget.background as ImageValue;
backgroundGradient = widget.background as LinearGradientValue;
baseline = widget.baseline;
bottomMargin = widget.bottom;
bounds = widget.bounds;
bounds = widget.absoluteBounds;
boxDim = widget.padding;
excludeFromLayout = widget.excludeFromLayout;
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
widget.background = backgroundImage;
widget.background = backgroundColor;
widget.background = backgroundGradient;
widget.baseline = baseline;
widget.bottom = bottomMargin;
widget.padding = boxDim;
widget.centerX = centerX;
widget.centerY = centerY;
widget.class = _class;
widget.classList = classList;
widget.data = {foo: 42};
widget.cornerRadius = cornerRadius;
widget.elevation = elevation;
widget.enabled = enabled;
widget.excludeFromLayout = excludeFromLayout;
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
const properties: Properties<Widget> = {
  background,
  baseline,
  bottom: bottomMargin,
  centerX,
  centerY,
  class: _class,
  classList,
  cornerRadius,
  data,
  elevation,
  enabled,
  excludeFromLayout,
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
const animationProperties: {transform?: Transformation, opacity?: number} = {};
const parent: Composite = new Composite();
const options: AnimationOptions = {};
const selector: Selector = '';
const otherWidget: Widget = new Composite();
let promise: Promise<void>;
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
composite = widget.parent('#foo');
composite = widget.parent((parentComposite: Composite) => parentComposite.id === 'foo');
const tf: TabFolder = widget.parent(TabFolder);
widgetCollection = widget.siblings();
widgetCollection = widget.siblings(selector);
fooCollection = widget.siblings(Foo);
// Events
const target: Widget = widget;
const timeStamp: number = 0;
const type: string = 'foo';
const state: 'start'|'change'|'end'|'cancel' = 'start';
const touches: [{x: number, y: number}] = [{x: 0, y:0}];
const absTouches: [{x: number, y: number, absoluteX: number, absoluteY: number}] =
  [{x: 0, y: 0, absoluteX: 0, absoluteY: 0}];
const translationX: number = 0;
const translationY: number = 0;
const velocityX: number = 0;
const velocityY: number = 0;
const disposeEvent: EventObject<Widget> = {target, timeStamp, type};
const resizeEvent: WidgetResizeEvent = {target, timeStamp, type, height: 0, left: leftOffset, top: topOffset, width: 0};
const swipeDownEvent: WidgetSwipeEvent = {target, timeStamp, type, touches};
const swipeLeftEvent: WidgetSwipeEvent = {target, timeStamp, type, touches};
const swipeRightEvent: WidgetSwipeEvent = {target, timeStamp, type, touches};
const swipeUpEvent: WidgetSwipeEvent = {target, timeStamp, type, touches};
const touchCancelEvent: WidgetTouchEvent = {target, timeStamp, type, touches: absTouches};
const touchEndEvent: WidgetTouchEvent = {target, timeStamp, type, touches: absTouches};
const touchMoveEvent: WidgetTouchEvent = {target, timeStamp, type, touches: absTouches};
const touchStartEvent: WidgetTouchEvent = {target, timeStamp, type, touches: absTouches};
const tapEvent: WidgetTapEvent = {target, timeStamp, type, touches};
const longPressEvent: WidgetLongPressEvent = {target, timeStamp, type, state, touches};
const panEvent: WidgetPanEvent = {
  target, timeStamp, type, state, touches, translationX, translationY, velocityX, velocityY
};
const panDownEvent: WidgetPanEvent = {
  target, timeStamp, type, state, touches, translationX, translationY, velocityX, velocityY
};
const panHorizontalEvent: WidgetPanEvent = {
  target, timeStamp, type, state, touches, translationX, translationY, velocityX, velocityY
};
const panLeftEvent: WidgetPanEvent = {
  target, timeStamp, type, state, touches, translationX, translationY, velocityX, velocityY
};
const panRightEvent: WidgetPanEvent = {
  target, timeStamp, type, state, touches, translationX, translationY, velocityX, velocityY
};
const panUpEvent: WidgetPanEvent = {
  target, timeStamp, type, state, touches, translationX, translationY, velocityX, velocityY
};
const panVerticalEvent: WidgetPanEvent = {
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
  .onLongPress((event: WidgetLongPressEvent) => {})
  .onPan((event: WidgetPanEvent) => {})
  .onPanDown((event: WidgetPanEvent) => {})
  .onPanHorizontal((event: WidgetPanEvent) => {})
  .onPanLeft((event: WidgetPanEvent) => {})
  .onPanRight((event: WidgetPanEvent) => {})
  .onPanUp((event: WidgetPanEvent) => {})
  .onPanVertical((event: WidgetPanEvent) => {});
