---
---
Property Types
==============

## AnimationOptions

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

## Bounds

Widget bounds are represented as an object with the following properties:

* **left**: *number*
The horizontal offset from the parent's left edge in dip
* **top**: *number*
The vertical offset from the parent's top edge in dip
* **width**: *number*
The width of the widget in dip
* **height**: *number*
The height of the widget in dip

Example:
```js
let buttonWidth = button.bounds.width;
```

See also [Layout](layout.md).

## BoxDimensions

Dimensions to be applied on all four sides of a widget, as used for padding.

* **left**: *number*
The offset from the left edge in dip
* **right**: *number*
The offset from the right edge in dip
* **top**: *number*
The offset from the top edge in dip
* **bottom**: *number*
The offset from the bottom edge in dip

Example:
```js
composite.padding = {left: 8, right: 8, top: 0, bottom: 0};
```

## PropertyChangedEvent

An event fired when an object property changes. It has following properties:

- **target**: *Widget*
The widget the event was fired on.
- **value**: *any*
The new value of the changed property.

## ColorValue

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

## Dimension

A positive float, or 0, representing device independent pixels.

See also [Layout](layout.md).

## Margin

Distance to a parent's or sibling's opposing edge in one of these formats:

* [`offset`](#offset)
* [`percentage`](#percentage)
* [`Widget`](api/Widget.md)
* [`"selector"`](#selector)
* `"prev()"`
* `"next()"`
* `"percentage offset"`
* `"selector offset"`
* `"prev() offset"`
* `"next() offset"`
* `[Widget, offset]`
* `[percentage, offset]`
* `[selector, offset]`
* `["prev()", offset]`
* `["next()", offset]`

See also [Layout](layout.md).

## FontValue

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

## PercentValue

Percentages can be specified as strings or [Percent](./Percent.html)/Percent-like objects.

A **Percent** instance can be created with the **Percent** constructor or using **Percent.from**.

A **Percent**-like object is a plain object with a *percent* property, which is a number between and including 0 and 100.

Example: `{percent: 50}`

A percent string contains a number between and including 0 and 100 and ends with `%`.

Example: `"50%"`

## ImageValue

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

## ImageLikeObject
An plain object with following properties:

* **src**: *string*
    File system path, relative path or URL. The [data URI](https://en.wikipedia.org/wiki/Data_URI_scheme) scheme is also supported. Relative paths are resolved relative to 'package.json'. On Android the name of a bundled [drawable resource](https://developer.android.com/guide/topics/resources/drawable-resource.html) can be provided with the url scheme `android-drawable`, e.g. `android-drawable://ic_info_black`.
* **width**: *number | 'auto' (optional)*
    Image width in dip, extracted from the image file when missing or `'auto'`.
* **height**: *number | 'auto' (optional)*
    Image height in dip, extracted from the image file when missing or `'auto'`.
* **scale**: *number | 'auto' (optional)*
    Image scale factor, the image will be scaled down by this factor. The scale will be inferred from the image file name if it follows the pattern "@\<scale\>x", e.g. `"image@2x.jpg"`. The pattern is ignored if `scale`, `width` or `height` are set to a number or if `scale` is set to `"auto"`.

## LayoutData

Used to define how a widget should be arranged within its parent. See ["Layouts"](layout.md).

## Offset

A positive or negative float, or 0, representing device independent pixels.

See also [Layout](layout.md).

## Percentage

A string starting with a number (int) followed directly by `%`. May be negative.

See also [Layout](layout.md).

## Transformation

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

## Selector

Selectors are used to filter a given list of widgets. A selector can be a string, a widget constructor, or a filter function.
* When it is a string, it may either reference a widget type (e.g. `'Button'`, `'TextView'`), its id (`'#myButton'`, `'#myTextView'`), or its class property (`'.myButtons'`). A `'*'` matches all widgets. When selectors are used with the widget methods `find` and `apply`, the `:host` selector matches the widget that the selector is used on. This is useful in combination with child selectors, which use the syntax `Selector1 > Selector2`, so for example `:host > Button`.
* When it is a widget constructor, a widget matches if it is an instance of that class/type. This is different from giving the type as a string, as subclasses are also matched. For example, `Composite` would match also match an instance of `Tab` or `Page`.
* When it is a filter function, the function must accept a widget as the first parameter and return a boolean to indicate a match.

For more information, see [this article](./selector.md).

## ImageData

Represents the underlying pixel data of an area of a canvas element. It is created using the creator methods on the [CanvasContext](api/CanvasContext.md): createImageData() and getImageData(). It can also be used to set a part of the canvas by using putImageData().
An ImageData object has the following read-only properties:
* **data**: *Uint8ClampedArray* one-dimensional array containing the data in the RGBA order, with integer values between `0` and `255`
* **width**: *number* width in pixels of the ImageData
* **height**: *number* height in pixels of the ImageData
