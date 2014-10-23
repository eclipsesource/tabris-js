Image
=====
Image is an object with the following properties:

* `src`
* `width` - optional, calculated when missing.
* `height` - optional, calculated when missing.
* `scale` - optional, ignored when width or height are set.

An image object can look like this:

```javascript
{src: "image.jpg", width: 200, height: 200, scale: 2}
```

Font
====
Font is a string using a syntax similar to the CSS font shorthand syntax. The
difference is that the font family may be omitted, in this case the default
system font will be used. Example:
```javascript
"bold 24px"
```

Color
=====
Color is a string using a similar syntax to the CSS color syntax. The currently
supported formats are:

* *#xxxxxx*
* *#xxx*
* *rgb(r, g, b)* with *r*, *g* and *b* number arguments in the range 0..255.
* *rgba(r, g, b, a)* with a number in the range 0..1.
* color names from the CSS3 specification.

Template
========
The `template` property is an array of cell definitions which allow you to bind
data to them.

Cell definition
----------------------
Each cell definition must contain the following properties:

* `binding` refers to either the array index of the data to be bound if the data
item was an array or to the object property of the corresponding data if the
data item was an object.
* `type` takes either *image* or *text* as values.

Optionally one can specify:

* `left`, `right`, `top` and `bottom` are arrays containing two values - the
first is the distance from the corresponding edge (top, left, bottom, right) of
the template as a percentage of the template's width and the second is a fixed
offset in pixels to add to the percentage.
* `width` and `height` - specify the width and the height of the cell in pixels.
* `horizontalAlignment` - specifies the horizontal alignment of the cell. It
takes one of the values *LEFT*, *CENTER* and *RIGHT*.
* `verticalAlignment` - specifies the vertical alignment of the cell. It takes
one of the values *TOP*, *CENTER* and *BOTTOM*.
* `font` - takes a *font* type property.
* `foreground` and `background` - take a *color* type property.

### Cells of the type *image* support:

* `scaleMode` - specifies the type of image scaling. Can be one of the
values:
  * *NONE* - displays the image in original size.
  * *FIT* - defines an image scaled to the maximum size that fits into the cell
  while preserving the aspect ratio.
  * *FILL* - scales the image to the minimum size required to cover the entire
  cell also while preserving the aspect ratio.
  * *STRETCH* - scales the image to the exact bounds of the cell not preserving
  the aspect ratio.

### Cells of the type *text* support:

* `wrap` - specifies whether the cell text contents should wrap on a new line if
they don't fit in the cell bounds.

Provided you write a book store application, a template may look like this:
```javascript
[
  {
    type: "image",
    binding: "image",
    scaleMode: "FIT",
    left: [0, 0], top: [0, 0], width: 32, height: 48
  }, {
    type: "text",
    binding: "title",
    left: [0, 56], right: [0, 0], top: [0, 0], bottom: [0, 0],
    foreground: "rgb(74, 74, 74)"
  }, {
    type: "text",
    binding: "author",
    left: [0, 56], right: [0, 0], top: [0, 36], bottom: [0, 0],
    foreground: "rgb(123, 123, 123)"
  }
]
```