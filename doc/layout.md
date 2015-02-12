# Layout

tabris.js uses the native platform capabilities to layout UIs. As display density widely varies among mobile devices the pixel measures in tabris.js are always expressed as [Device Independent Pixels](https://en.wikipedia.org/wiki/Device_independent_pixel).

## Layout Data

All widgets support a property `layoutData` that defines how the widget should be arranged. The value of `layoutData` must be an object with a combination of the following keys:

- `left`
- `right`
- `top`
- `bottom`
- `centerX`
- `centerY`
- `baseline`
- `width`
- `height`

If a widget is referenced in a layoutData, it has to be a sibling of the widget the layoutData is applied to. In place of a widget a `selector` string can also be given. The string is used to filter all siblings of the widget, using the first match as the reference. The selector may also reference a widget that will be added after the layoutData is set. However, once a widget is matched the selector will not be applied again. (The matching widget can not be replaced with another matching widget without re-applying the layoutData.)
 
A widget reference that does not point to a current sibling will be treated as an offset of 0. 

### left
Defines the position of the widget's left edge.
Accepted values:

- *offset*: the distance from the parent's left edge in pixels
- [*percentage*, *offset*]: the distance from the parent's left edge in percent of the parent's width plus a fixed offset in pixels
- [*widget*, *offset*]: the distance from the given widget's right edge in pixels

### right
Defines the position of the widget's right edge.
Accepted values:

- *offset*: the distance from the parent's right edge in pixels
- [*percentage*, *offset*]: the distance from the parent's right edge in percent of the parent's width plus a fixed offset in pixels
- [*widget*, *offset*]: the distance from the given widget's left edge in pixels

### top
Defines the position of the widget's upper edge.
Accepted values:

- *offset*: the distance from the parent's upper edge in pixels
- [*percentage*, *offset*]: the distance from the parent's upper edge in percent of the parent's height plus a fixed offset in pixels
- [*widget*, *offset*]: the distance from the given widget's lower edge in pixels

### bottom
Defines the position of the widget's lower edge.
Accepted values:

- *offset*: the distance from the parent's lower edge in pixels
- [*percentage*, *offset*]: the distance from the parent's lower edge in percent of the parent's height plus a fixed offset in pixels
- [*widget*, *offset*]: the distance from the given widget's upper edge in pixels

### centerX
Defines the horizontal position of the widget relative to the parent's center.
Accepted values:

- *offset*: the distance of this widget's horizontal center line from the parent's horizontal center

This property cannot be used in combination with either of `left` and `right`.

### centerY
Defines the vertical position of the widget relative to the parent's center.
Accepted values:

- *offset*: the distance of this widget's vertical center line from the parent's vertical center

This property cannot be used in combination with either of `top`, `bottom`, and `baseline`.

### baseline
Defines the vertical position of the widget relative to another widget's text baseline.
Accepted values:

- *widget*: a reference to another widget to baseline-align with.

At the moment, this property is only supported for widgets that contain text, i.e. both the actual and the referenced widget must be one of `Label`, `Button`, or `Text`.

For multiline texts, the platforms currently differ: Android aligns on the first line, iOS on the last line.

This property cannot be used in combination with either of `top`, `bottom`, and `centerY`.

### width
Defines the width of the widget.
Accepted values:

- *width*: the width of the widget in pixels

### height
Defines the height of the widget.
Accepted values:

- *height*: the height of the widget in pixels

## Layout calculation

### Size

When `width` is not specified, the width is defined by the difference between `right` and `left`. When either `left` or `right` is also missing, the widget will shrink to its intrinsic width, i.e. the minimal width required to display its content.

When `height` is not specified, the height is defined by the difference between `bottom` and `top`. When either `top` or `bottom` is also missing, the widget will shrink to its intrinsic height, i.e. the minimal height required to display its content.

### Position

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

```javascript
layoutData: {
  left: 10,          // 10px from left edge
  top: [label, 10],  // label's bottom edge + 10px, i.e. 10px below label
  right: [30, 10]    // 30% + 10px from right edge, i.e. at 70% - 10px
                     // no height or bottom given, i.e. auto-height
}
```

## Z-Order

When the layout definition results in widgets overlapping one another, the z-order is defined by the order in which the widgets are appended to their parent. New widgets will be rendered on top of those widgets that have already been appended.

## Device Independent Pixels

The density of a device's display can be accessed by `window.devicePixelRatio`. The value represents the number of native pixels per Device Independent Pixel.

## Known issues

* Aligning widgets with the bottom attribute may lead to an expansion of the parent widget on Android.
* Aligning widgets on widgets that are themselves aligned on a baseline does not work correctly on Android.
* Retrieving the bounds of widgets that have been transformed reflects the position defined by layoutData on Android but the actual (translated) position on iOS.
* Setting a transformation on a widget may influence its layout on iOS 7. A workaround is to provide an absolute position for the widget (left, top, width, height).
