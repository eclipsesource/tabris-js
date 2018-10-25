import {
  ColorValue,
  FontValue,
  ImageValue,
  Widget,
  Composite,
  Button,
  Bounds,
  Transformation,
  Selector,
  SelectorFunction,
  Dimension,
  Offset,
  ConstraintValue,
  AnimationOptions,
  WidgetCollection,
  SiblingReferenceValue
} from 'tabris';

let stringType: string = '';
let stringOrUndefined: string | undefined;
let numberType: number = 42;
let numberOrUndefinedOrAuto: number | undefined | 'auto';
let booleanType: boolean = false;
let booleanOrUndefined: boolean | undefined;
let constraintType: ConstraintValue|'auto' = ['#foo', 23];
constraintType = [new Composite(), 23];
constraintType = 23;
constraintType = 'foo';
constraintType = new Composite();
let offsetType: Offset = 42;
let offsetOrAuto: Offset | 'auto';
let dimensionType: Dimension = 42;
let dimensionOrAuto: Dimension | 'auto';
let widgetOrSelector: Widget | Selector = new Button();
let widgetOrSelectorOrAuto: SiblingReferenceValue | 'auto';

// dimension
let dimension: Dimension = numberType;
numberType = dimension;

// Offset
let _offset: Offset = numberType;
numberType = _offset;

// Image
let image: ImageValue = {
  src: stringType,
  width: numberType,
  height: numberType
};
image = {src: ''};
stringType = image.src;
numberOrUndefinedOrAuto = image.width;
numberOrUndefinedOrAuto = image.height;
numberOrUndefinedOrAuto = image.scale;

// Color
let color: ColorValue = stringType;
stringType = color;

// Font
let font: FontValue = stringType;
stringType = font;

// Bounds
let bounds: Bounds = {
  left: numberType,
  top: numberType,
  width: numberType,
  height: numberType
};

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
numberOrUndefinedOrAuto = transformation.rotation;
numberOrUndefinedOrAuto = transformation.scaleX;
numberOrUndefinedOrAuto = transformation.scaleY;
numberOrUndefinedOrAuto = transformation.translationX;
numberOrUndefinedOrAuto = transformation.translationY;
numberOrUndefinedOrAuto = transformation.translationZ;

// SelectorFunction
let selectorFunctionType: (widget: Widget, index: number, collection: WidgetCollection) => boolean = () => true;
let selectorFunction: Selector = selectorFunctionType;
selectorFunctionType = selectorFunction as typeof selectorFunctionType;

// Selector
let selectorType: string | SelectorFunction<Widget> = '';
let selector: Selector = selectorType;
selectorType = selector;

// AnimationOptions
let easingType: 'linear'|'ease-in'|'ease-out'|'ease-in-out';
let easingOrUndefined: typeof easingType | undefined;
easingType = 'linear';

let animationOptions: AnimationOptions = {
  delay: numberType,
  duration: numberType,
  easing: easingType,
  repeat: numberType,
  reverse: booleanType,
  name: stringType
};
animationOptions = {};
numberOrUndefinedOrAuto = animationOptions.delay;
numberOrUndefinedOrAuto = animationOptions.duration;
easingOrUndefined = animationOptions.easing;
numberOrUndefinedOrAuto = animationOptions.repeat;
booleanOrUndefined = animationOptions.reverse;
stringOrUndefined = animationOptions.name;
