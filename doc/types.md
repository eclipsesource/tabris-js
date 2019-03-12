---
---
Data Types
==========

## Layout API

See also [Layout](layout.md).

### Bounds

* JavaScript Type: `Object`
* TypeScript Type: `tabris.Bounds`

The bounds of a rectangle in relation to the top-left corner of a containing element in DIP (device independent pixel). This is a plain object implementing the following interface:

```ts
interface Bounds {
  left: number;
  top: number;
  width: number;
  height: number;
}
```

Explanation:

Property | Description
---------|--------------------------------------------------
left     | The horizontal offset from the parent's left edge
top      | The vertical offset from the parent's top edge
width    | The width of the widget
height   | The height of the widget

Example:

```js
const buttonRight = button.bounds.left + button.bounds.width;
```

### BoxDimensions

* JavaScript Type: `Object` or `string` or `Array`.
* TypeScript Type: `tabris.BoxDimensions`

The bounds of a rectangle in relation to the four edges of a containing element in DIP (device independent pixel). By default it is a plain object implementing the following interface:

```ts
interface BoxDimensions {
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
}
```

All properties are [`dimension`](#Dimension) and optional. Omitted properties are treated as `0`.

As a shorthand a list of four dimensions is also accepted. This follow the order of `[top, right, bottom, left]`, with missing entries being filled in by the entry of the opposing dimension. If only one entry is given it is used for all dimensions:

```js
[1, 2, 3, 4] // {top: 1, right: 2, bottom: 3, left: 4};
[1, 2, 3] // {top: 1, right: 2, bottom: 3, left: 2};
[1, 2] // {top: 1, right: 2, bottom: 1, left: 2};
[1] // {top: 1, right: 1, bottom: 1, left: 1};
```

A space separated string list is also accepted instead of an array, with or without `px` as a unit.

Examples:

```js
widget.padding = {left: 8, right: 8, top: 0, bottom: 0};
widget.padding = {left: 10, right: 10};
widget.padding = [0, 8];
widget.padding = [1, 10, 2, 10];
widget.padding = '10px 11px 12px 13px';
widget.padding = '10 11 12 13';
widget.padding = '0 8';
```

### ConstraintValue

* JavaScript Type: `tabris.Constraint`, `tabris.Widget`, `tabris.Percent`, `Symbol`, `Array`, `Object`, `string` or `number`
* TypeScript Type: `tabris.ConstraintValue`

A `ConstraintValue` represents a constraint on the layout of a widget that the parent uses to determine the position of one of its edges. This type allows various expressions that can all be used in place of a [`Constraint`](./api/Constraint.md) instance for convenience. All API that accept these expressions will convert them to a `Constraint` object. (With the exception of `CanvasContext`.)

Every expression of `ConstraintValue` consists of a [`reference`](./api/Constraint.md#reference) value and/or an [`offset`](./api/Constraint.md#offset) value. The following are all valid `ConstraintValue` types:

#### Offset-only constraints

Simply the [`Offset`](#offset) number by itself, a positive float including zero.

Examples:

```js
widget.left = 12.5;
widget.right = 8;
widget.top = 0;
widget.bottom = 0;
```

#### Reference-only constraints

Either a [`PercentValue`](#PercentValue) or a [`SiblingReferenceValue`](#SiblingReferenceValue).

Examples:

```js
widget.left = '12%';
widget.right = 'prev()';
widget.top = new Percent(50);
widget.bottom = '#foo';
```

#### Constraint instance

An instance of the [`Constraint`](./api/Constraint.md) class naturally is also a valid `ConstraintValue`. It may be created via its [constructor](./api/Constraint.md#constructor) or the less strict [`Constraint.from`](./api/Constraint.md#from) factory.

#### ConstraintLikeObject

An object implementing the following interface:

```ts
interface ConstraintLikeObject {
  reference?: SiblingReferenceValue | PercentValue;
  offset?: Offset;
}
```

An instances of [`Constraint`](./api/Constraint.md) is a valid `ConstraintLikeObject`, but `ConstraintLikeObject` is less strict:  The `reference` property can be a [`PercentValue`](#PercentValue) or a [`SiblingReferenceValue`](#SiblingReferenceValue), or can be omitted if  [`offset`](#offset) is given. Either of the two entries may be omitted, but not both.

Examples:

```js
widget.left = {reference: sibling, offset: 12};
widget.right = {reference: '23%', offset: 12};
widget.top = {reference: Constraint.prev};
widget.bottom = {offset: 12};
```

#### ConstraintArrayValue

An array tuple in the format of `[reference, offset]`, where `reference` is either a [`PercentValue`](#PercentValue) or a [`SiblingReferenceValue`](#SiblingReferenceValue), and offset is an [`Offset`](#offset), i.e. a `number`.

Examples:

```js
widget.left = [sibling, 0];
widget.right = ['#foo', 0];
widget.top = [{percent: 23}, 12];
widget.bottom = [Constraint.prev, 12];
```

#### Constraint String

This is often the most compact way to express a constraint, but it may not be the preferred way in TypeScript projects if type safety is a priority. The string consists of a space separated list of two values in the pattern of `'reference offset'`. The reference part may be of any string as accepted by [`SiblingReferenceValue`](#SiblingReferenceValue) or [`PercentValue`](#PercentValue). The offset has to be a positive (including zero) float, just like [`Offset`](#offset).

Examples:

```js
widget.left = '.bar 0';
widget.right = '#foo 0'
widget.top = '23% 12';
widget.bottom = 'prev() 12';
```

### Dimension

* JavaScript Type: `number`
* TypeScript Type: `tabris.Dimension`, an alias for `number`

A positive float, or 0, representing device independent pixels (DIP).

### LayoutDataValue

* JavaScript Type: `tabris.LayoutData`, `Object`
* TypeScript Type: `tabris.LayoutDataValue`

A `LayoutDataValue` provides layout information for a widget to be used its parent when determining its size and position. It allows various expressions that can all be used in place of a [`LayoutData`](./api/LayoutData.md) instance for convenience. All API that accepts these expressions will convert them to a `LayoutData` object.

The following are all valid `LayoutDataValue` types:

#### LayoutData instance

An instance of the [`LayoutData`](./api/LayoutData.md) class naturally is also a valid `LayoutDataValue`. It may be created via its [constructor](./api/LayoutData.md#constructor) or the less strict [`LayoutData.from`](./api/LayoutData.md#from) factory.

#### LayoutDataLikeObject

An object containing implementing the following interface:

```ts
interface LayoutDataLikeObject {
  left?: 'auto' | ConstraintValue;
  right?: 'auto' | ConstraintValue;
  top?: 'auto' | ConstraintValue;
  bottom?: 'auto' | ConstraintValue;
  centerX?: 'auto' | Offset;
  centerY?: 'auto' | Offset;
  baseline?: 'auto' | SiblingReferenceValue;
  width?: 'auto' | Dimension;
  height?: 'auto' | Dimension;
}
```

An instance of [`LayoutData`](./api/LayoutData.md) is a valid `LayoutDataLikeObject`, but in `LayoutDataLikeObject` all properties are optional and less strict. For example `left`, `top`, `right` and `bottom` accept [`ConstraintValue`](#ConstraintValue) (e.g. a `number`) in place of a [`Constraint`](./api/Constraint.md) instance.

Example:

```js
widget.layoutData = {
  baseline: 'prev()',
  left: 10,
  width: 100
}
```

#### LayoutData string

The strings `'center'` and `'fill'` may also be used in place of a LayoutData object to express `{centerX: 0, centerY: 0}` and `{left: 0, top: 0, right: 0, bottom: 0}` with less characters.

```js
widget.layoutData = 'fill';
```

### Offset

* JavaScript Type: `number`
* TypeScript Type: `tabris.Offset`, an alias for `number`

A positive or negative float, or 0, representing device independent pixels (DIP).

### PercentValue

* JavaScript Type: `tabris.Percent`, `Object`, `string`
* TypeScript Type: `tabris.PercentValue`

Represents a percentage. This type includes various expressions that can all be used in place of a [`Percent`](./api/Percent.md) instance for convenience. All APIs that accept these expressions will convert them to a `Percent` object.

In TypeScript you can import this type as a union with `import {PercentValue} from 'tabris';` or use `tabris.PercentValue`. [Type guards](https://www.typescriptlang.org/docs/handbook/advanced-types.html#type-guards-and-differentiating-types) for `PercentValue` are available as [`Percent.isPercentValue`](./api/Percent.md#isPercentValue) and [`Percent.isValidPercentValue`](./api/Percent.md#isValidPercentValue).

#### Percent instance

An instance of the [`Percent`](./api/Percent.md) class naturally is also a valid `PercentValue`. It may be created via its [constructor](./api/Percent.md#constructor) or the more versatile [`Percent.from`](./api/Percent.md#from) factory.

#### PercentLikeObject

A plain object in the format of `{percent: number}`, where `100` presents 100%. An instance of [`Percent`](./api/Percent.md) is a valid `PercentLikeObject`.

Examples:

```js
widget.left = {percent: 50};
```

#### Percent String

A number followed by `%`.

Example: `'50%'`

### SiblingReference

* JavaScript Type: `tabris.Widget`, `Symbol`, `string`
* TypeScript Type: `tabris.SiblingReference`

A `SiblingReference` indicates a single sibling of a given Widget. Differs from the type [`SiblingReferenceValue`](#SiblingReferenceValue) in that it does not include `'next()` and `'prev()'` as selectors strings. [It uses symbols instead](#Sibling-Reference-Symbol). There are three variants of `SiblingReference`:

#### Sibling instance

Any widget instance that has the same parent.

#### Sibling Selector String

A simple selector string of the format `'#Type'`, `'#id'`, `'.class'`. No child selectors. The first matching sibling is selected.

#### Sibling Reference Symbol

The constants [`Constraint.prev`]('./api/Constraint#prev') and [`Constraint.next`]('./api/Constraint#next') (also available as [`LayoutData.prev`]('./api/LayoutData#prev') and [`LayoutData.next`]('./api/LayoutData#next')) may be used to point to the sibling directly before/after the reference widget in the parents children list.

### SiblingReferenceValue

* JavaScript Type: `tabris.Widget`, `Symbol`, `string`
* TypeScript Type: `tabris.SiblingReferenceValue`

Same as [`SiblingReference`](#SiblingReference), but less strict in that it also allows the strings `'next()` and `'prev()'` in place of the [`prev`]('./api/Constraint#prev') and [`next`]('./api/Constraint#next') symbols.

## Styling Related Types

Types related to the visual presentation of a widget.

### ColorValue

* JavaScript Type: `tabris.Color`, `Object`, `Array`, `string`
* TypeScript Type: `tabris.ColorValue`

A `ColorValue` represents a 24 bit color, plus an alpha channel for opacity. This type allows various expressions that can all be used in place of a [`Color`](./api/Color.md) instance for convenience. All API that accept these expressions will convert them to a `Color` object. (With the exception of `CanvasContext`.) Setting a ColorValue property to null resets it to the default.

In TypeScript you can import this type as a union with `import {ColorValue} from 'tabris';` or use `tabris.ColorValue`. [Type guards](https://www.typescriptlang.org/docs/handbook/advanced-types.html#type-guards-and-differentiating-types) for `ColorValue` are available as [`Color.isColorValue`](./api/Color.md#isColorValue) and [`Color.isValidColorValue`](./api/Color.md#isValidColorValue).

The following are all valid `ColorValue` types:

#### Color instance

An instance of the [`Color`](./api/Color.md) class may be created via its [constructor](./api/Color.md#constructor) or the less strict [`Color.from`](./api/Color.md#from) factory.

Examples:

```js
new Color(255, 0, 0)
new Color(255, 0, 0, 200)
Color.from("rgba(255, 0, 0, 0.8)")
```

#### ColorLikeObject

 An object implementing the following interface:

```ts
interface ColorLikeObject {
  red: number;
  green: number;
  blue: number;
  alpha?: number;
}
```

An instance of [`Color`](./api/Color.md) is a valid `ColorLikeObject`.

Examples:

```js
{red: 255, green: 255, blue: 255}
{red: 255, green: 255, blue: 255, alpha: 200}
```

#### ColorArray

An array in the shape of `[red, green, blue, alpha]`. All entries should be natural number between (and including) 0 and 255. If omitted, alpha is 255.

Examples:

```js
[255, 0, 0]
[255, 0, 0, 200]
```

#### Color string

Any string in the following format:

Pattern              | Description
---------------------|------------
`"#rrggbb"`          | Hexadecimal rgb, with each value being between and including `00` and `ff`.
`"#rgb"`             | Hexadecimal rgb, with each value being between and including `0` and `f`.
`"#rrggbbaa"`        | Hexadecimal rgba, with each value being between and including `00` and `ff`.
`"#rgba"`            | Hexadecimal rgba, with each value being between and including `0` and `f`.
`"rgb(r, g, b)"`     | With `r`, `g` and `b` being numbers in the range 0..255.
`"rgba(r, g, b, a)"` | With `a` being a number in the range 0..1.
`"transparent"`      | Sets a fully transparent color. Same as `rgba(0, 0, 0, 0)`.
`"initial"`          | Resets the color to its (platform-dependent) default. Same as `null`.

[Color names](http://www.w3.org/TR/css3-color/#html4) from the CSS3 specification are also accepted. They are available as static string properties of `Color`, e.g. `Color.lime`. These exist just to help with autocompletion.

Examples:

```js
"#f00"
"#ff0000"
"#ff000080" // 50% opacity red
"#ff06" // 40% opacity yellow
"rgb(255, 0, 0)"
"rgba(255, 0, 0, 0.8)"
"red"
"initial" // same as null
```

### FontValue

A `FontValue` describes a font by size, family, weight and style. This type allows various expressions that can all be used in place of a [`Font`](./api/Font.md) instance for convenience. All API that accept these expressions will convert them to a `Font` object. (With the exception of `CanvasContext`.) Setting a FontValue property to null resets it to the default.

Generic **font size** is always given as DIP (device independent pixels), though the string shorthand expects `"px"` as a unit. It's still DIPs.

Generic **font families** are supported across all platforms: `"serif"`, `"sans-serif"`, `"condensed"` and `"monospace"`. These are available as static string properties of `Font`, e.g. `Font.serif`. These exist just to help with autocompletion. More families can be added via `app.registerFont`. If no family is given for a font the system default is used. If no font family is given the default system font will be used. The string `"initial"` represents the platform default.

Supported **font weights** are `"light"`, `"thin"`, `"normal"`, `"medium"`, `"bold"` and `"black"`. The default is `"normal"`

Supported **font styles** are `"italic"` and `"normal"`. The default is `"normal"`

In TypeScript you can import this type as a union with `import {FontValue} from 'tabris';` or use `tabris.FontValue`. [Type guards](https://www.typescriptlang.org/docs/handbook/advanced-types.html#type-guards-and-differentiating-types) for `FontValue` are available as [`Font.isFontValue`](./api/Font.md#isFontValue) and [`Font.isValidFontValue`](./api/Font.md#isValidFontValue).

The following are all valid `FontValue` types:

#### Font instance

An instance of the [`Font`](./api/Font.md) class may be created via its [constructor](./api/Font.md#constructor) or the less strict [`Font.from`](./api/Font.md#from) factory.

Examples:

```js
new Font({size: 16, family: Font.sansSerif})
Font.from("16px san-serif");
```

#### FontLikeObject

 An object implementing the following interface:

```ts
interface FontLikeObject {
  size: number;
  family?: string[];
  weight?: FontWeight;
  style?: FontStyle;
}
```

An instance of [`Font`](./api/Font.md) is a valid `FontLikeObject`.

Examples:

```js
{size: 16, weight: 'bold'}
{size: 24, family: 'sans-serif', style: 'italic'}
```

#### Font string

 As a string, a subset of the shorthand syntax known from CSS is used: `"font-style font-weight font-size font-family"`, where every value except size is optional. The size also need to have a `"px"` postfix. Multiple families may be given separated by commas. Families with spaces in their name need to be put in single or double quotes.

Examples:

```js
"bold 24px"
"12px sans-serif"
"italic thin 12px sans-serif"
"24px 'My Font', sans-serif"
"initial"
```

### ImageValue

A `ImageValue` describes an image file path and that image's dimension or scale. This type allows various expressions that can all be used in place of a [`Image`](./api/Image.md) instance for convenience. All API that accept these expressions will convert them to a `Image` object.

The **source** (shortened to `src`) is a File system path, relative path or URL. The [data URI](https://en.wikipedia.org/wiki/Data_URI_scheme) scheme is also supported. Relative paths are resolved **relative to the projects 'package.json'**. On Android the name of a bundled [drawable resource](https://developer.android.com/guide/topics/resources/drawable-resource.html) can be provided with the url scheme `android-drawable`, e.g. `android-drawable://ic_info_black`.

The **width** and **height** of an image are specified in DIP (device independent pixel). If none are given (e.g. value is `"auto"`) the dimensions from the image file are used in combination with the given **scale**.

The **scale** is a positive float or `'auto'`. The image will be scaled down by this factor. Ignored if **width** or **height** are given. If neither **scale**, **width** or **height** are given the scale may be extracted from image file name if it follows the pattern "@\<scale\>x", e.g. `"image@2x.jpg"`. If the scale can not be determined by any of these methods it will be treated as `1`.

The scale factor of the image is relevant when the intrinsic size (in DIP) of the image is needed for layouting. On high-density displays (i.e. [devices with a  scale factor higher than 1](./api/device.md#scaleFactor)) an undetermined image scale factor (or scale factor `1`) may make the image look blurry at full its full natural size.  It is the application developers responsibility to provide and use image files with the appropriate scale factor for any given device.

The following are all valid `ImageValue` types:

#### Image instance

An instance of the [`Image`](./api/Image.md) class may be created via its [constructor](./api/Image.md#constructor) or the less strict [`Image.from`](./api/Image.md#from) factory.

Examples:

```js
new Image({src: "http://example.com/catseye.jpg", scale: 2})
new Image({src: "http://example.com/catseye.jpg", width: 100, height: 200})
Image.from("images/catseye@2x.jpg");
```

#### ImageLikeObject

 An object implementing the following interface:

```ts
interface ImageLikeObject {
  src: string;
  scale?: number | "auto";
  width?: number | "auto";
  height?: number | "auto";
}
```

An instance of [`Image`](./api/Image.md) class is a valid `ImageLikeObject`.

Examples:

```js
{src: "images/catseye.jpg", width: 300, height: 200}
{src: "http://example.com/catseye.jpg", scale: 2}
```

### LinearGradientValue

A `LinearGradientValue` specifies a set of colors, their relative position along a straight line, and the angle of that line. This describes a color gradient that can be drawn to fill any area, usually the background of a widget. This type allows various expressions that can all be used in place of a [`LinearGradient`](./api/LinearGradient.md) instance for convenience. All API that accept these expressions will convert them to a `LinearGradient` object.

In TypeScript you can import this type as a union with `import {LinearGradientValue} from 'tabris';` or use `tabris.LinearGradientValue`. [Type guards](https://www.typescriptlang.org/docs/handbook/advanced-types.html#type-guards-and-differentiating-types) for `LinearGradientValue` are available as [`LinearGradient.isLinearGradientValue`](./api/LinearGradient.md#isLinearGradientValue) and [`LinearGradient.isValidLinearGradientValue`](./api/LinearGradient.md#isValidLinearGradientValue).

The following are all valid `LinearGradientValue` types:

#### LinearGradient instance

An instance of the [`LinearGradient`](./api/LinearGradient.md) class may be created via its [constructor](./api/LinearGradient.md#constructor) or the less strict [`LinearGradient.from`](./api/Image.md#from) factory.

Examples:

```js
new LinearGradient([Color.red, Color.green]);
new LinearGradient([[Color.red, new Percent(5)], Color.green], 90);
LinearGradient.from({colorStops: [['red', '5%'], 'green'], direction: 'left'});
LinearGradient.from('linear-gradient(45deg, red 5%, green)');
```

#### LinearGradientLikeObject

An object implementing the following interface:

```ts
interface LinearGradientLikeObject {
  colorStops: Array<ColorValue | [ColorValue, PercentValue]>,
  direction?: number | 'left' | 'top' | 'right' | 'bottom'
}
```

An instances of [`LinearGradient`](./api/LinearGradient.md) is a valid `LinearGradientLikeObject`, but `LinearGradientLikeObject` is less strict as it accepts more expressions for `colorStops` and `direction`.
Examples:

```js
{colorStops: [['red', '5%'], 'green'], direction: 'left'}
{colorStops: [['red', '5%'], 'green'], direction: 45}
```

#### LinearGradient string

 As a string, a subset of the CSS syntax is used:

```css
<color-stop> ::= <color> [ <number>% ]
<linear-gradient> ::= linear-gradient(
    [ <number>deg | to ( left | top | right | bottom ), ]
    <color-stop> {, <color-stop>}
)
```

Examples:

```js
"linear-gradient(red, green)"
"linear-gradient(to left, red 5%, green)"
"linear-gradient(45deg, red 5%, green)"
```

## Binary Types

### ImageData

Represents the underlying pixel data of an area of a `Canvas` widget. It is created using the creator methods on the [CanvasContext](api/CanvasContext.md): `createImageData()` and `getImageData()`. It can also be used to set a part of the canvas by using `putImageData()`.

An ImageData object implements the following interface:

```ts
interface ImageData {
  data: Uint8ClampedArray;
  width: number;
  height: number;
}
```

Explanation:

Property | Description
---------|-------------
`data`   | One-dimensional array containing the data in the RGBA order, with integer values between `0` and `255`.
`width`  | Width in pixels of the ImageData.
`height` | Height in pixels of the ImageData.

## Selector API

### Selector

See [this article](./selector.md).

## Animation API

### AnimationOptions

Options of the [`animate()`](api/Widget.md#animateproperties-options) method. They have to implement the following interface:

```ts
interface AnimationOptions {
  delay?: number;
  duration?: number;
  easing?: "linear" | "ease-in" | "ease-out" | "ease-in-out";
  repeat?: number;
  reverse?: boolean;
  name?: string;
}
```

Each property has a default value if omitted:

Property   | Default            | Description
-----------|--------------------|------------
`delay`    | `0`                | Time until the animation starts in ms.
`duration` | (platform default) | Animation duration in ms.
`easing`   | `linear`           | Acceleration/deceleration curve
`repeat`   | `0`                | Number of times to repeat the animation.
`reverse`  | `true`             | Should the direction of the animation alternative on every repeat.
`name`     | `undefined`        | No effect, but will be given in animation events.

### Transformation

A Transformation is any object implementing the following interface:

```ts
interface Transformation {
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
  translationX?: number;
  translationY?: number;
  translationZ?: number;
}
```

Each property has a default value if omitted:

Property       | Default | Description
---------------|---------|------------
`rotation`     | `0`     |  Clock-wise rotation in radians.
`scaleX`       | `1`     |  Horizontal scale factor.
`scaleY`       | `1`     |  Vertical scale factor.
`translationX` | `0`     |  Horizontal translation (shift) in DIP (device independent pixels).
`translationY` | `0`     |  Vertical translation (shift) in DIP.
`translationZ` | `0`     |  Z-axis translation (shift) in DIP.

Example:

```js
{scaleX: 2, scaleY: 2, rotation: Math.PI * 0.75}
```
This transformation will make the widget twice as big and rotate it by 135&deg;.

## Event Handling

### PropertyChangedEvent

An event object fired when an object property changes. It is an instance of [`EventObject`](./types/EventObject.md) that provides an additional property `value` containing the new value.
