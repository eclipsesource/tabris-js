tabris.js native layout
=======================

Controls support a new property `layoutData`.

The property `layoutData` is a JSON object. Accepted keys are:

- `left`
- `top`
- `right`
- `bottom`
- `width`
- `height`

Acceptable values for `left`, `top`, `right`, and `bottom`:

- *offset*
- [ *percentage*, *offset* ]
- [ *widget*, *offset* ]

*offset* is a number, specified in px
*percentage* is a number in the range 0 .. 100
*widget* is the reference to a widget

Acceptable values for `width` and `height`:

- size as positive number in px

When there is no `layoutData` specified for a widget, the behavior is undefined.
If some properties are missing, the following rules apply:

* When `width` is not specified, the width is defined by the difference between `right` and `left`. When either `left` or `right` is also missing, the widget should shrink to it's minimal width.

* When both `left` and `right` are missing, the widget should be aligned on the left edge.

* When `height` is not specified, the height is defined by the difference between `bottom` and `top`. When either `top` or `bottom` is also missing, the widget should shrink to it's minimal height.

* When both `top` and `bottom` are missing, the widget should be aligned on the top edge.

Example:

    layoutData: {
      left: 10,          // 10px from left edge
      top: [label, 10],  // label's bottom edge + 10px, i.e. 10px below label
      right: [30, 10]    // 30% + 10px from right edge, i.e. at 70% - 10px
                         // no height or bottom given, i.e. auto-height
    }
