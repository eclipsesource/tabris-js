Translation
===========
Translation is an object with the following properties:

* `scaleX` - a factor specifying the scale amount in the x-axis. Default is 1.
* `scaleY` - a factor specifying the scale amount in the y-axis. Default is 1.
* `rotation` - specifies the rotation in radians. Default is 0.
* `translationX` - translation in the x-axis in pixels. Default is 0.
* `translationY` - translation in the y-axis in pixels. Default is 0.

This will make the widget twice as big and rotate it by 135°:
```javascript
{scaleX: 2, scaleY: 2, rotation: Math.PI * 0.75}
```

Opacity
=======
Opacity is a float number between 0 and 1.

Image
=====
Images are specified as objects with the following properties:

* `src` - image path or URL
* `width` - (optional) extracted from image file when missing
* `height` - (optional) extracted from image file when missing
* `scale` - (optional) ignored when width or height are set

Examples:

```javascript
{src: "images/catseye.jpg", width: 300, height: 200}
{src: "http://example.com/catseye.jpg", scale: 2}
```

Font
====
Fonts are specified as strings using the shorthand syntax known from CSS. The font family may be omitted, in this case the default system font will be used.

Examples:

```javascript
"bold 24px"
"12px sans-serif"
```

Color
=====
Colors are specified as strings using one of the following formats:

* `#xxxxxx`
* `#xxx`
* `rgb(r, g, b)` with `r`, `g` and `b` being numbers in the range 0..255.
* `rgba(r, g, b, a)` with `a` being a number in the range 0..1.
* a [color name](http://www.w3.org/TR/css3-color/#html4) from the CSS3 specification.

Examples:

```javascript
"#f00"
"#ff0000"
"#rgb(255, 0, 0)"
"#rgba(255, 0, 0, 0.8)"
"red"
```
