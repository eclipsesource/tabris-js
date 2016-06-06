Property Types
==============

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
```javascript
var buttonWidth = button.get("bounds").width;
```

See also [Layout](layout.md).

## Color

Colors are specified as strings using one of the following formats:

* `#xxxxxx`
* `#xxx`
* `rgb(r, g, b)` with `r`, `g` and `b` being numbers in the range 0..255.
* `rgba(r, g, b, a)` with `a` being a number in the range 0..1.
* a [color name](http://www.w3.org/TR/css3-color/#html4) from the CSS3 specification.
* `transparent` sets a fully transparent color. This is a shortcut for `rgba(0, 0, 0, 0)`.
* `initial` resets the color to its (platform-dependent) default.

Examples:

```javascript
"#f00"
"#ff0000"
"#rgb(255, 0, 0)"
"#rgba(255, 0, 0, 0.8)"
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
* `"percentage offset"`
* `"selector offset"`
* `"prev() offset"`
* `[Widget, offset]`
* `[percentage, offset]`
* `[selector, offset]`
* `["prev()", offset]`

See also [Layout](layout.md).

## Font

Fonts are specified as strings using the shorthand syntax known from CSS, specifically `"[font-style] [font-weight] font-size [font-family[, font-family]*]"`. The font family may be omitted, in this case the default system font will be used. Generic font families supported across all platforms are `"serif"`, `"sans-serif"`, `"condensed"` and `"monospace"`. Supported font weights are `"light"`, `"thin"`, `"normal"`, `"medium"`, `"bold"` and `"black"`. The value `"initial"` represents the platform default.

Examples:

```javascript
"bold 24px"
"12px sans-serif"
"thin italic 12px sans-serif"
"initial"
```

## GestureObject

Object containing information about the currently performed gesture. See ["Touch API"](touch.md#gesture_object).

## Image

Images are specified as objects with the following properties:

* **src**: *string*
    Image path or URL. Relative paths are resolved relative to 'package.json'.
* **width**: *number (optional)*
    Image width in dip, extracted from the image file when missing.
* **height**: *number (optional)*
    Image height in dip, extracted from the image file when missing.
* **scale**: *number (optional)*
    Image scale factor - the image will be scaled down by this factor. Ignored when width or height are set.

A plain string can be used as a shorthand, e.g. `"image.jpg"` equals `{src: "image.jpg"}`.

Examples:

```javascript
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

A string starting with a number (int) followed directly by "%". May be negative.

See also [Layout](layout.md).

## TouchEvent

Object containing information about the currently performed gesture. See ["Touch API"](touch.md#touch_event_object).

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

```javascript
{scaleX: 2, scaleY: 2, rotation: Math.PI * 0.75}
```
This transformation will make the widget twice as big and rotate it by 135&deg;.

## Selector

Selectors are used to filter a given list of widgets. It can be function returning a boolean for a given widget.
However, more commonly a selector is a string that may either reference a widgets type (e.g. `"Button"`, `"TextView"`), or its id (`"#myButton"`, `"#myTextView"`).
