import {
  Image,
  Color,
  Font,
  LayoutData,
  Widget,
  Composite,
  Button,
  Bounds,
  Transformation,
  Selector,
  SelectorFunction,
  dimension,
  offset,
  margin,
  AnimationOptions,
} from 'tabris';

let stringType: string = '';
let stringOrUndefined: string | undefined;
let numberType: number = 42;
let numberOrUndefined: number | undefined;
let booleanType: boolean = false;
let booleanOrUndefined: boolean | undefined;
let marginType: margin = ['#foo', 23];
marginType = [new Composite(), 23];
marginType = [23, 23];
marginType = 23;
marginType = 'foo';
marginType = new Composite();
let offsetType: offset = 42;
let offsetOrUndefined: offset | undefined;
let dimensionType: dimension = 42;
let dimensionOrUndefined: dimension | undefined;
let widgetOrSelector: Widget | Selector = new Button();
let widgetOrSelectorOrUndefined: Widget | Selector | undefined;
let widgetType: Widget = new Button();
let widgetOrUndefined: Widget | undefined;

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
image = {src: ''};
stringType = image.src;
numberOrUndefined = image.width;
numberOrUndefined = image.height;
numberOrUndefined = image.scale;

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
    baseline: widgetOrSelector,
    width: dimensionType,
    height: dimensionType
};
layoutData = {};
marginType = layoutData.left;
marginType = layoutData.right;
marginType = layoutData.top;
marginType = layoutData.bottom;
offsetOrUndefined = layoutData.centerX;
offsetOrUndefined = layoutData.centerY;
widgetOrSelectorOrUndefined = layoutData.baseline;
dimensionOrUndefined = layoutData.width;
dimensionOrUndefined = layoutData.height;

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
numberOrUndefined = transformation.rotation;
numberOrUndefined = transformation.scaleX;
numberOrUndefined = transformation.scaleY;
numberOrUndefined = transformation.translationX;
numberOrUndefined = transformation.translationY;
numberOrUndefined = transformation.translationZ;

// SelectorFunction
let selectorFunctionType: (widget: Widget) => boolean = () => true;
let selectorFunction: SelectorFunction = selectorFunctionType;
selectorFunctionType = selectorFunction;

// Selector
let selectorType: string | SelectorFunction = '';
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
numberOrUndefined = animationOptions.delay;
numberOrUndefined = animationOptions.duration;
easingOrUndefined = animationOptions.easing;
numberOrUndefined = animationOptions.repeat;
booleanOrUndefined = animationOptions.reverse;
stringOrUndefined = animationOptions.name;
