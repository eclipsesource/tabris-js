---
---
# Layout

Tabris.js uses the native platform capabilities to layout UIs. As display density widely varies among mobile devices the pixel measures in Tabris.js are always expressed as [Device Independent Pixels](https://en.wikipedia.org/wiki/Device_independent_pixel).

## Layout Data

All widgets support a property `layoutData` that defines how the widget should be arranged. The value of `layoutData` must be an object with a combination of the following attributes:

- `left`
- `right`
- `top`
- `bottom`
- `centerX`
- `centerY`
- `baseline`
- `width`
- `height`

> :point_right: All layout attributes can also be set directly on the widget as a normal property. The advantage of using the `layoutData` property is that all currently set layout attributes not in the new `layoutData` object will be implicitly reset to null (i.e. "not specified").

### top, right, bottom, left

Defines the position of the widget's edge.
Accepted values:

- *offset*: the distance from the parent's opposing edge in device independent pixels
- *widget*: attach this edge to the given sibling's opposing edge
- *percentage*: the distance from the parent's opposing edge in percent of the parent's width
- [*percentage*, *offset*]: the distance from the parent's opposing edge in percent of the parent's width plus a fixed offset in pixels
- "*percentage* *offset*": Same as above, but as space-separated string list instead of array
- [*widget*, *offset*]: the distance from the given widget's opposing edge in pixel
- "*widget* *offset*": Same as above, but as space-separated string list instead of array. Since this is a string the widget can be a selector or `"prev()"`, but not a direct reference.

All **percentages** are provided as strings with a percent suffix, e.g. `"50%"`.

**References to other widgets** can be given as a variable, a [selector string](selector.md) (filtering all siblings of the widget), or the symbolic reference `"prev()"` (used to refer to the preceding sibling). Widget references are resolved dynamically, that is, if a referenced widget is added or removed later, the layout will adjust. When a widget reference does not match any of the current siblings, it will be treated like an offset of zero.

### centerX

Defines the horizontal position of the widget relative to the parent's center.
Accepted values:

- *offset*: the distance of this widget's horizontal center line from the parent's horizontal center in device independent pixel

This property cannot be used in combination with either of `left` and `right`.

### centerY

Defines the vertical position of the widget relative to the parent's center.
Accepted values:

- *offset*: the distance of this widget's vertical center line from the parent's vertical center in device independent pixel

This property cannot be used in combination with either of `top`, `bottom`, and `baseline`.

### baseline

Defines the vertical position of the widget relative to another widget's text baseline.
Accepted values:

- *widget*: a reference to another widget to baseline-align

The widget may be referenced with a variable, a [selector string](selector.md), or with `"prev()"`.

At the moment, this property is only supported for widgets that contain text, i.e. both the actual and the referenced widget must be one of `TextView`, `TextInput`, or `Button`.

For multiline texts, the platforms currently differ: Android aligns on the first line, iOS on the last line.

This property cannot be used in combination with either of `top`, `bottom`, and `centerY`.

### width

Defines the width of the widget.
Accepted values:

- *width*: the width of the widget in device independent pixel

### height

Defines the height of the widget.
Accepted values:

- *height*: the height of the widget in device independent pixel

## Layout calculation

### Size

When `width` is not specified, the width is defined by the difference between `right` and `left`. When either `left` or `right` is also missing, the widget will shrink to its intrinsic width, i.e. the minimal width required to display its content.

When `height` is not specified, the height is defined by the difference between `bottom` and `top`. When either `top` or `bottom` is also missing, the widget will shrink to its intrinsic height, i.e. the minimal height required to display its content.

### Fallback position

When neither of `left`, `right`, and `centerX` is specified, the widget will be aligned on the parent's left edge.

When neither of `top`, `bottom`, `centerY` and `baseline` is specified, the widget will be aligned on the parent's upper edge.

When there is no `layoutData` specified for a widget, the widget will be be displayed in the top left corner.

### Conflicting properties

Some combinations of properties result in conflicting layout descriptions. To resolve those cases, some properties take precedence over others:

When both `left` and `right` are specified, the property `width` will be ignored.
When both `top` and `bottom` are specified, the property `height` will be ignored.

When `centerX` is specified, the properties `left` and `right` will be ignored.
When `centerY` is specified, the properties `top` and `bottom` will be ignored.
When `baseline` is specified, the properties `top`, `bottom`, and `centerY` will be ignored.

## Example

```js
layoutData: {
  left: 10,            // 10px from left edge
  top: ["#label", 10], // label's bottom edge + 10px, i.e. 10px below label
  right: ["30%", 10]   // 30% + 10px from right edge, i.e. at 70% - 10px
                       // no height or bottom given, i.e. auto-height
}
```

## Z-Order

When the layout definition results in widgets overlapping one another, the z-order is defined by the order in which the widgets are appended to their parent. New widgets will be rendered on top of those widgets that have already been appended.

## Device Independent Pixels

The density of a device's display can be accessed by `window.devicePixelRatio`. The value represents the number of native pixels per Device Independent Pixel.
