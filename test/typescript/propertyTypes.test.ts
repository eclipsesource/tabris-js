import {
 Image,
 Color,
 Font,
 LayoutData,
 Widget,
 TapGesture,
 LongpressGesture,
 PanGesture,
 SwipeGesture,
 GestureObject,
 TouchEvent,
 Bounds,
 Transformation,
 Selector,
 SelectorFunction,
 dimension,
 offset,
 margin,
 AnimationOptions,
} from 'tabris';

let stringType: string;
let numberType: number;
let booleanType: boolean;
let marginType: margin;
let offsetType: offset;
let dimensionType: dimension;
let widgetType: Widget;

// dimension
let _dimension: dimension = numberType;
numberType = _dimension;

// offset
let _offset: offset = numberType;
numberType = _offset;

// Image
let image: Image = {
  src: stringType,
  width: numberType,
  height: numberType,
  scale: numberType
};
image = {};
stringType = image.src;
numberType = image.width;
numberType = image.height;
numberType = image.scale;

// Color
let color: Color = stringType;
stringType = color;

// Font
let font: Font = stringType;
stringType = font;

// LayoutData
let layoutData: LayoutData = {
    left: marginType,
    right: marginType,
    top: marginType,
    bottom: marginType,
    centerX: offsetType,
    centerY: offsetType,
    baseline: widgetType,
    width: dimensionType,
    height: dimensionType
};
layoutData = {};
marginType = layoutData.left;
marginType = layoutData.right;
marginType = layoutData.top;
marginType = layoutData.bottom;
offsetType = layoutData.centerX;
offsetType = layoutData.centerY;
widgetType = layoutData.baseline;
dimensionType = layoutData.width;
dimensionType = layoutData.height;

// TapGesture
let tapStateType: 'recognized';
let touchesType: [{x: number, y: number}];

let tapGesture: TapGesture = {
  state: tapStateType,
  touches: touchesType
};
tapStateType = tapGesture.state;
touchesType = tapGesture.touches;

// LongpressGesture
let longpressStateType: 'start' | 'end' | 'cancel';

let longpressGesture: LongpressGesture = {
  state: longpressStateType,
  touches:  touchesType
};
longpressStateType = longpressGesture.state;
touchesType = longpressGesture.touches;

// PanGesture
let panStateType: 'start' | 'end' | 'change' | 'cancel';

let panGesture: PanGesture = {
  state: panStateType,
  translation:  touchesType,
  velocity:  touchesType,
  touches:  touchesType,
};
panStateType = panGesture.state;
touchesType = panGesture.translation;
touchesType = panGesture.velocity;
touchesType = panGesture.touches;

// SwipeGesture
let swipeStateType: 'recognized';

let swipeGesture: SwipeGesture = {
  state: swipeStateType,
  touches:  touchesType
};
swipeStateType = swipeGesture.state;
touchesType = swipeGesture.touches;

// GestureObject
let gestureObjectType: TapGesture | LongpressGesture | SwipeGesture | PanGesture;
let gestureObject: GestureObject = gestureObjectType;
gestureObjectType = gestureObject;

// TouchEvent
let touchEvent: TouchEvent = {
  time: numberType
};
numberType = touchEvent.time;

// Bounds
let bounds: Bounds = {
  left: numberType,
  top: numberType,
  width: numberType,
  height: numberType
};
bounds = {};
numberType = bounds.left;
numberType = bounds.top;
numberType = bounds.width;
numberType = bounds.height;

// Transformation
let transformation: Transformation = {
  rotation: numberType,
  scaleX: numberType,
  scaleY: numberType,
  translationX: numberType,
  translationY: numberType,
  translationZ: numberType
};
transformation = {};
numberType = transformation.rotation;
numberType = transformation.scaleX;
numberType = transformation.scaleY;
numberType = transformation.translationX;
numberType = transformation.translationY;
numberType = transformation.translationZ;

// SelectorFunction
let selectorFunctionType: (widget: Widget) => boolean;
let selectorFunction: SelectorFunction = selectorFunctionType;
selectorFunctionType = selectorFunction;

// Selector
let selectorType: string | SelectorFunction;
let selector: Selector = selectorType;
selectorType = selector;

// AnimationOptions
let easingType: 'linear'|'ease-in'|'ease-out'|'ease-in-out';

let animationOptions: AnimationOptions = {
  delay: numberType,
  duration: numberType,
  easing: easingType,
  repeat: numberType,
  reverse: booleanType,
  name: stringType
};
animationOptions = {};
numberType = animationOptions.delay;
numberType = animationOptions.duration;
easingType = animationOptions.easing;
numberType = animationOptions.repeat;
booleanType = animationOptions.reverse;
stringType = animationOptions.name;
