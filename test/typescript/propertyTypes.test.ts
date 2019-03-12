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
  SiblingReferenceValue,
  BoxDimensions
} from 'tabris';

let stringType: string = '';
let stringOrUndefined: string | undefined;
let numberType: number = 42;
let numberOrUndefinedOrAuto: number | undefined | 'auto';
const booleanType: boolean = false;
let booleanOrUndefined: boolean | undefined;
let constraintType: ConstraintValue|'auto' = ['#foo', 23];
constraintType = [new Composite(), 23];
constraintType = 23;
constraintType = 'foo';
constraintType = new Composite();
const offsetType: Offset = 42;
let offsetOrAuto: Offset | 'auto';
const dimensionType: Dimension = 42;
let dimensionOrAuto: Dimension | 'auto';
const widgetOrSelector: Widget | Selector = new Button();
let widgetOrSelectorOrAuto: SiblingReferenceValue | 'auto';

// dimension
const dimension: Dimension = numberType;
numberType = dimension;

// Offset
const _offset: Offset = numberType;
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
const color: ColorValue = stringType;
stringType = color;

// Font
const font: FontValue = stringType;
stringType = font;

// Bounds
const bounds: Bounds = {
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
const selectorFunction: Selector = selectorFunctionType;
selectorFunctionType = selectorFunction as typeof selectorFunctionType;

// Selector
let selectorType: string | SelectorFunction<Widget> = '';
const selector: Selector = selectorType;
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

// BoxDimension
let boxDim: BoxDimensions = {left: 0, top: 0, right: 0, bottom: 0};
boxDim = {left: 0, top: 0, right: 0};
boxDim = {left: 0, top: 0};
boxDim = {left: 0};
boxDim = {};
boxDim = 8;
boxDim = '1px 2px 3px 4px';
boxDim = '1 2 3 4';
boxDim = [1, 2, 3, 4];
boxDim = [1, 2, 3];
boxDim = [1, 2];
boxDim = [1];
