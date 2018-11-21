---
---
Data Types
==========

## Layout API

See also [Layout](layout.md).

### Bounds

* JavaScript Type: `Object`
* TypeScript Type: `tabris.Bounds`
* JSX support: *No*
* Used by: [`widget.bounds`](./api/Widget.md#bounds), [`widget.onResize`](./api/Widget.md#resize)

Property | Type     | Optional | Description
---------|----------|----------|--------------------------------------------------
left     | `number` |  No      | The horizontal offset from the parent's left edge
top      | `number` |  No      | The vertical offset from the parent's top edge
width    | `number` |  No      | The width of the widget
height   | `number` |  No      | The height of the widget

The bounds of a rectangle in relation to the top-left corner of a containing element in device-independent pixel (DIP).

Example:

```js
const buttonRight = button.bounds.left + button.bounds.width;
```

### BoxDimensions

* JavaScript Type: `Object`
* TypeScript Type: `tabris.BoxDimensions`
* JSX support: *No*
* Used by: [`composite.padding`](./api/Composite.md#padding)

Property | Type                      | Optional | Description
---------|---------------------------|----------|--------------------------------------------------
left     | [`Dimension`](#Dimension) |  No      | The offset from the left edge
right    | [`Dimension`](#Dimension) |  No      | The vertical offset from the parent's top edge
top      | [`Dimension`](#Dimension) |  No      | The width of the widget
bottom   | [`Dimension`](#Dimension) |  No      | The height of the widget

The bounds of a rectangle in relation to the four edges of a containing element in device-independent pixel (DIP).

Example:

```js
composite.padding = {left: 8, right: 8, top: 0, bottom: 0};
```

### ConstraintValue

* JavaScript Type: `tabris.Constraint`, `tabris.Widget`, `tabris.Percent`, `Symbol`, `Array`, `Object`, `string` or `number`
* TypeScript Type: `tabris.ConstraintValue`
* JSX support: *No*
* Used by:
  * [`layoutDataValue.left`](#LayoutDataValue), [`layoutDataValue.top`](#LayoutDataValue), [`layoutDataValue.right`](#LayoutDataValue), [`layoutDataValue.bottom`](#LayoutDataValue)
  * [`widget.left`](./api/Widget.md#left), [`widget.top`](./api/Widget.md#top), [`widget.right`](./api/Widget.md#right), [`widget.bottom`](./api/Widget.md#bottom)
  * [`Constraint.from`](./api/Constraint.md#from)

A `ConstraintValue` represents a constraint on the layout of a widget that the parent uses to determine the position of one of its edges. This type allows various expressions that can all be used in place of a [`Constraint`](./api/Constraint.md) instance for convenience. All API that accept these expressions will convert them to a `Constraint` object.

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
widget.right = {percent: 50};
widget.top = new Percent(50);
widget.bottom = '0%';
```

#### Constraint instance

An instance of the [`Constraint`](./api/Constraint.md) class naturally is also a valid `ConstraintValue`. It may be created via its [constructor](./api/Constraint.md#constructor) or the less strict [`Constraint.from`](./api/Constraint.md#from) factory.

#### ConstraintLikeObject

A plain object in the format of `{reference, offset}`, where `reference` is either a [`PercentValue`](#PercentValue) or a [`SiblingReferenceValue`](#SiblingReferenceValue), and offset is an [`Offset`](#offset), i.e. a `number`. Either of the two entries may be omitted, but not both.

Examples:

```js
widget.left = {reference: sibling, offset: 12};
widget.right = {reference: '23%', offset: 12};
widget.top = {reference: Constraint.prev};
widget.bottom = {offset: 12};
```

#### ConstraintArrayValue

A tuple in the format of `[reference, offset]`, where `reference` is either a [`PercentValue`](#PercentValue) or a [`SiblingReferenceValue`](#SiblingReferenceValue), and offset is an [`Offset`](#offset), i.e. a `number`.

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
* JSX support: *No*

A positive float, or 0, representing device independent pixels (DIP).

### LayoutDataValue

* JavaScript Type: `tabris.LayoutData`, `Object`
* TypeScript Type: `tabris.LayoutDataValue`
* JSX support: *No*
* Used by: [`widget.layoutData`](./api/Widget.md#layoutData), [`LayoutData.from`](./api/LayoutData.md#from)

A `LayoutDataValue` provides layout information for a widget to be used its parent when determining its size and position. It allows various expressions that can all be used in place of a [`LayoutData`](./api/LayoutData.md) instance for convenience. All API that accepts these expressions will convert them to a `LayoutData` object.

The following are all valid `LayoutDataValue` types:

#### LayoutData instance

An instance of the [`LayoutData`](./api/LayoutData.md) class naturally is also a valid `LayoutDataValue`. It may be created via its [constructor](./api/LayoutData.md#constructor) or the less strict [`LayoutData.from`](./api/LayoutData.md#from) factory.

#### LayoutDataLikeObject

A plain object containing properties for some or all properties present on the [`LayoutData`](./api/LayoutData.md) class type. Unlike [`LayoutData`](./api/LayoutData.md) all properties are optional and less strict. For example `left`, `top`, `right` and `bottom` accept [`ConstraintValue`](#ConstraintValue) (e.g. a `number`) in place of a [`Constraint`](./api/Constraint.md) instance.

Property  | Type                                                          | Optional | Default   | Description
----------|---------------------------------------------------------------|----------|-----------|--------------------------------------------------------
left      | [`ConstraintValue`](#ConstraintValue) \| `'auto'`             |  Yes     | `'auto'`  | See [layoutData.left](./api/LayoutData.md#left)
top       | [`ConstraintValue`](#ConstraintValue) \| `'auto'`             |  Yes     | `'auto'`  | See [layoutData.top](./api/LayoutData.md#top)
right     | [`ConstraintValue`](#ConstraintValue) \| `'auto'`             |  Yes     | `'auto'`  | See [layoutData.right](./api/LayoutData.md#right)
bottom    | [`ConstraintValue`](#ConstraintValue) \| `'auto'`             |  Yes     | `'auto'`  | See [layoutData.bottom](./api/LayoutData.md#bottom)
width     | [`Dimension`](#Dimension) \| `'auto'`                         |  Yes     | `'auto'`  | See [layoutData.width](./api/LayoutData.md#width)
heigh     | [`Dimension`](#Dimension) \| `'auto'`                         |  Yes     | `'auto'`  | See [layoutData.heigh](./api/LayoutData.md#heigh)
centerX   | [`Offset`](#Offset) \| `'auto'`                               |  Yes     | `'auto'`  | See [layoutData.centerX](./api/LayoutData.md#centerX)
centerY   | [`Offset`](#Offset) \| `'auto'`                               |  Yes     | `'auto'`  | See [layoutData.centerY](./api/LayoutData.md#centerY)
baseline  | [`SiblingReferenceValue`](#SiblingReferenceValue) \| `'auto'` |  Yes     | `'auto'`  | See [layoutData.baseline](./api/LayoutData.md#baseline)

Example:

```js
widget.layoutData = {
    baseline: 'prev()',
    left: 10,
    width: 100
}
```

### Offset

* JavaScript Type: `number`
* TypeScript Type: `tabris.Offset`, an alias for `number`

A positive or negative float, or 0, representing device independent pixels (DIP).

### PercentValue

* JavaScript Type: `tabris.Percent`, `Object`, `string`
* TypeScript Type: `tabris.PercentValue`
* JSX support: *No*
* Used by: [`ConstraintLikeObject`](#ConstraintLikeObject), [`ConstraintArrayValue`](#ConstraintArrayValue), [`Percent.from`](./api/Percent.md#from)

Represents a percentage. This type includes various expressions that can all be used in place of a [`Percent`](./api/Percent.md) instance for convenience. All APIs that accept these expressions will convert them to a `Percent` object.

#### Percent instance

An instance of the [`Percent`](./api/Percent.md) class naturally is also a valid `PercentValue`. It may be created via its [constructor](./api/Percent.md#constructor) or the more versatile [`Percent.from`](./api/Percent.md#from) factory.

#### PercentLikeObject

A plain object in the format of `{percent: number}`, where `100` presents 100%.

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
* JSX support: *No*
* Used by: [`constraint.reference`](./api/Constraint.md#reference), [`layoutData.baseline`](./api/LayoutData.md#baseline),

A `SiblingReference` indicates a single sibling of a given Widget. Differs from the type [`SiblingReferenceValue`](#SiblingReferenceValue) in that it only allows valid selectors as a string. There are three variants of `SiblingReference`:

#### Sibling instance

Any widget instance that has the same parent.

#### Sibling Selector String

A simple selector string of the format `'#Type'`, `'#id'`, `'.class'`. No child selectors. The first matching sibling is selected.

#### Sibling Reference Symbol

The constants [`Constraint.prev`]('./api/Constraint#prev') and [`Constraint.next`]('./api/Constraint#next') (also available as) [`LayoutData.prev`]('./api/LayoutData#prev') and [`LayoutData.next`]('./api/LayoutData#next') may be used to point to the sibling directly before/after the reference widget in the parents children list.

### SiblingReferenceValue

* JavaScript Type: `tabris.Widget`, `Symbol`, `string`
* TypeScript Type: `tabris.SiblingReferenceValue`
* JSX support: *No*
* Used by: [`ConstraintValue`](#ConstraintValue), [`LayoutDataValue`](#LayoutDataValue)

Same as [`SiblingReference`](#SiblingReference), except that it also allows the strings `'next()` and `'prev()'` in place of the [`prev`]('./api/Constraint#prev') and [`next`]('./api/Constraint#next') constants. As a result a `SiblingReferenceValue` may not be a valid selector string.

The following are all valid `LayoutDataValue` types:

## Styling Related Types

Types related to the visual presentation of a widget.

### ColorValue

Colors can be specified as strings, arrays or [Color](./Color.html)/Color-like objects.

A `Color` instance can be created with the `Color` constructor or using `Color.from`.

A `Color`-like object is a plain object with "red", "green", "blue" and optional "alpha" properties.

A color array has consist of 3 or 4 numbers between (and including) 0 and 255, i.e. `[red, green, blue, alpha]`. If omitted, alpha is 255.

As a string the following formats can be used:
* `#xxxxxx` Hexadecimal rgb
* `#xxx` Hexadecimal rgb
* `#xxxxxxxx` Hexadecimal rgba
* `#xxxx` Hexadecimal rgba
* `rgb(r, g, b)` with `r`, `g` and `b` being numbers in the range 0..255.
* `rgba(r, g, b, a)` with `a` being a number in the range 0..1.
* a [color name](http://www.w3.org/TR/css3-color/#html4) from the CSS3 specification.
* `transparent` sets a fully transparent color. This is a shortcut for `rgba(0, 0, 0, 0)`.
* `initial` resets the color to its (platform-dependent) default.

Setting a ColorValue property to null also resets it to the default.

<span class='typescript-only'>
In TypeScript you can import this union type with `import {ColorValue} from 'tabris';` or use `tabris.ColorValue`. Type guards for `ColorValue` are available as [`Color.isColorValue`](./Color.html#isColorValue) and [`Color.isValidColorValue`](./Color.html#isValidColorValue).

</span>
Examples:

```js
new Color(255, 0, 0)
new Color(255, 0, 0, 200)
[255, 0, 0]
[255, 0, 0, 200]
{red: 255, green: 255, blue: 255}
{red: 255, green: 255, blue: 255, alpha: 200}
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

Fonts can be specified as strings or [Font](./Font.html)/Font-like objects.

A **Font** instance can be created with the **Font** constructor or using **Font.from**.

Generic font families supported across all platforms are **"serif"**, **"sans-serif"**, **"condensed"** and **"monospace"**.
Supported font weights are **"light"**, **"thin"**, **"normal"**, **"medium"**, **"bold"** and **"black"**.

A **Font**-like object is a plain object with "size" and optional "family", "weight" and "style" properties.
Example: **{size: 16, family: ['serif'], weight: 'bold', style: 'italic'}**

As a string, the shorthand syntax known from CSS is used: **"[font-style] [font-weight] font-size [font-family[, font-family]*]"**. The font family may be omitted, in this case the default system font will be used. The value **"initial"** represents the platform default.

Examples:

```js
new Font({size: 16, family: Font.sansSerif})
{size: 16, weight: 'bold'}
"bold 24px"
"12px sans-serif"
"italic thin 12px sans-serif"
"initial"
```

### ImageValue

Images can be specified as strings or [Image](./Image.html)/[ImageLikeObject](#imagelikeobject).

An **Image** instance can be created using the **Image** constructor or using **Image.from**.

The string shorthand `"image.jpg"` equals `{src: "image.jpg"}`.

The scale can be part of the file name in the pattern of "@\<scale\>x", e.g. `"image@2x.jpg"`. The pattern is ignored if `scale`, `width` or `height` are explicitly given.

Examples:

```js
new Image({src: "http://example.com/catseye.jpg"})
new Image({src: "http://example.com/catseye.jpg", scale: 2})
"images/catseye.jpg"
"images/catseye@1.5x.jpg"
{src: "images/catseye.jpg", width: 300, height: 200}
{src: "http://example.com/catseye.jpg", scale: 2}
```

### ImageLikeObject
An plain object with following properties:

* **src**: *string*
    File system path, relative path or URL. The [data URI](https://en.wikipedia.org/wiki/Data_URI_scheme) scheme is also supported. Relative paths are resolved relative to 'package.json'. On Android the name of a bundled [drawable resource](https://developer.android.com/guide/topics/resources/drawable-resource.html) can be provided with the url scheme `android-drawable`, e.g. `android-drawable://ic_info_black`.
* **width**: *number | 'auto' (optional)*
    Image width in dip, extracted from the image file when missing or `'auto'`.
* **height**: *number | 'auto' (optional)*
    Image height in dip, extracted from the image file when missing or `'auto'`.
* **scale**: *number | 'auto' (optional)*
    Image scale factor, the image will be scaled down by this factor. The scale will be inferred from the image file name if it follows the pattern "@\<scale\>x", e.g. `"image@2x.jpg"`. The pattern is ignored if `scale`, `width` or `height` are set to a number or if `scale` is set to `"auto"`.

### LinearGradientValue

Linear gradients can be specified as strings, [LinearGradient](./LinearGradient.html) or `LinearGradient`-like objects.

A `LinearGradient` instance can be created using the `LinearGradient` constructor or using `LinearGradient.from`.

A `LinearGradient`-like object is a plain object with "colorStops" and optional "direction" properties. "colorStops" is an array containing atleast one `ColorValue` or `[ColorValue, PercentValue]`. "direction" is a degree number or one of "left", "top", "right" and "bottom".

As string, following CSS subset can be used:

```css
<color-stop> ::= <color> [ <number>% ]
<linear-gradient> ::= linear-gradient( [ <number>deg | to ( left | top | right | bottom ), ] <color-stop> { , <color-stop> } )
```

Examples:

```
new LinearGradient([Color.red, Color.green]);
new LinearGradient([[Color.red, new Percent(5)], Color.green], 90);
LinearGradient.from({colorStops: [['red', '5%'], 'green'], direction: 'left'});
LinearGradient.from({colorStops: [['red', '5%'], 'green'], direction: 45});
LinearGradient.from('linear-gradient(red, green)');
LinearGradient.from('linear-gradient(to left, red 5%, green)');
LinearGradient.from('linear-gradient(45deg, red 5%, green)');
```

## Binary Types

### ImageData

Represents the underlying pixel data of an area of a canvas element. It is created using the creator methods on the [CanvasContext](api/CanvasContext.md): createImageData() and getImageData(). It can also be used to set a part of the canvas by using putImageData().
An ImageData object has the following read-only properties:
* **data**: *Uint8ClampedArray* one-dimensional array containing the data in the RGBA order, with integer values between `0` and `255`
* **width**: *number* width in pixels of the ImageData
* **height**: *number* height in pixels of the ImageData

## Selector API

### Selector

Selectors are used to filter a given list of widgets. A selector can be a string, a widget constructor, or a filter function.
* When it is a string, it may either reference a widget type (e.g. `'Button'`, `'TextView'`), its id (`'#myButton'`, `'#myTextView'`), or its class property (`'.myButtons'`). A `'*'` matches all widgets. When selectors are used with the widget methods `find` and `apply`, the `:host` selector matches the widget that the selector is used on. This is useful in combination with child selectors, which use the syntax `Selector1 > Selector2`, so for example `:host > Button`.
* When it is a widget constructor, a widget matches if it is an instance of that class/type. This is different from giving the type as a string, as subclasses are also matched. For example, `Composite` would match also match an instance of `Tab` or `Page`.
* When it is a filter function, the function must accept a widget as the first parameter and return a boolean to indicate a match.

For more information, see [this article](./selector.md).

## Animation API

### AnimationOptions

Options of the [`animate()`](api/Widget.md#animateproperties-options) method. They have following properties:

- **delay**: *number*, default: `0`
Time until the animation starts in ms.
- **duration**: *number*
Animation duration in ms.
- **easing**: *string*
One of `linear`, `ease-in`, `ease-out`, `ease-in-out`.
- **repeat**: *number*, default: `0`
Number of times to repeat the animation.
- **reverse**: *boolean*
`true` to alternate the direction of the animation on every repeat.
- **name**: *string*
No effect, but will be given in animation events.

### Transformation

Transformations are specified as an object with the following properties:

* **rotation**: *number*, default: `0`
    Clock-wise rotation in radians.
* **scaleX**: *number*, default: `1`
    Horizontal scale factor.
* **scaleY**: *number*, default: `1`
    Vertical scale factor.
* **translationX**: *number*, default: `0`
    Horizontal translation (shift) in dip.
* **translationY**: *number*, default: `0`
    Vertical translation (shift) in dip.
* **translationZ**: *number*, default: `0`
    Z-axis translation (shift) in dip. Android 5.0+ only.

Example:

```js
{scaleX: 2, scaleY: 2, rotation: Math.PI * 0.75}
```
This transformation will make the widget twice as big and rotate it by 135&deg;.

## Event Handling

### PropertyChangedEvent

An event fired when an object property changes. It has following properties:

- **target**: *Widget*
The widget the event was fired on.
- **value**: *any*
The new value of the changed property.
