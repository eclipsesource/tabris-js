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

## Color

Colors are specified as strings using one of the following formats:

* `#xxxxxx` Hexadecimal rgb
* `#xxx` Hexadecimal rgb
* `#xxxxxxxx` Hexadecimal rgba
* `#xxxx` Hexadecimal rgba
* `rgb(r, g, b)` with `r`, `g` and `b` being numbers in the range 0..255.
* `rgba(r, g, b, a)` with `a` being a number in the range 0..1.
* a [color name](http://www.w3.org/TR/css3-color/#html4) from the CSS3 specification.
* `transparent` sets a fully transparent color. This is a shortcut for `rgba(0, 0, 0, 0)`.
* `initial` resets the color to its (platform-dependent) default.

Examples:

```js
"#f00"
"#ff0000"
"#ff000080" // 50% opacity red
"#ff06" // 40% opacity yellow
"rgb(255, 0, 0)"
"rgba(255, 0, 0, 0.8)"
"red"
"initial"
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

## Font

Fonts are specified as strings using the shorthand syntax known from CSS, specifically `"[font-style] [font-weight] font-size [font-family[, font-family]*]"`. The font family may be omitted, in this case the default system font will be used. Generic font families supported across all platforms are `"serif"`, `"sans-serif"`, `"condensed"` and `"monospace"`. Supported font weights are `"light"`, `"thin"`, `"normal"`, `"medium"`, `"bold"` and `"black"`. The value `"initial"` represents the platform default.

Examples:

```js
"bold 24px"
"12px sans-serif"
"thin italic 12px sans-serif"
"initial"
```

## Image

Images are specified as objects with the following properties:

* **src**: *string*
    File system path, relative path or URL. Android and iOS also support [data URI](https://en.wikipedia.org/wiki/Data_URI_scheme). Relative paths are resolved relative to 'package.json'. On Android the name of a bundled [drawable resource](https://developer.android.com/guide/topics/resources/drawable-resource.html) can be provided with the url scheme `android-drawable`, e.g. `android-drawable://ic_info_black`.
* **width**: *number (optional)*
    Image width in dip, extracted from the image file when missing.
* **height**: *number (optional)*
    Image height in dip, extracted from the image file when missing.
* **scale**: *number (optional)*
    Image scale factor - the image will be scaled down by this factor. Ignored when width or height are set.

A plain string can be used as a shorthand, e.g. `"image.jpg"` equals `{src: "image.jpg"}`.

Examples:

```js
"images/catseye.jpg"
{src: "images/catseye.jpg", width: 300, height: 200}
{src: "http://example.com/catseye.jpg", scale: 2}
```

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
* When it is a string, it may either reference a widget type (e.g. `'Button'`, `'TextView'`), its id (`'#myButton'`, `'#myTextView'`), or its class property (`'.myButtons'`). A `'*'` matches all widgets.
* When it is a widget constructor, a widget matches if it is an instance of that class/type. This is different from giving the type as a string, as subclasses are also matched. For example, `Composite` would match also match an instance of `Tab` or `Page`.
* When it is a filter function, the function must accept a widget as the first parameter and return a boolean to indicate a match.

## ImageData

Represents the underlying pixel data of an area of a canvas element. It is created using the creator methods on the [CanvasContext](api/CanvasContext.md): createImageData() and getImageData(). It can also be used to set a part of the canvas by using putImageData().
An ImageData object has the following read-only properties:
* **data**: *Uint8ClampedArray* one-dimensional array containing the data in the RGBA order, with integer values between `0` and `255`
* **width**: *number* width in pixels of the ImageData
* **height**: *number* height in pixels of the ImageData
