---
---
# Layout

Tabris.js uses the native platform capabilities to layout UIs. As display density (pixels per inch) widely varies among mobile devices the pixel measures in Tabris.js are always expressed as [Device Independent Pixels](https://en.wikipedia.org/wiki/Device_independent_pixel) (DIP). The density of a device's display can be accessed by `e tabris.device.scaleFactor`. The value represents the number of native pixels per Device Independent Pixel.

## Layout Property

The property `layout` of the `Composite` widget contains a layout manager that is responsible for arranging the children of the composite. Different subclasses of `Composite` have different default values of `layout`:

Type                 | Default            | Settable
---------------------|--------------------|------------
`Composite`          | `ConstraintLayout` | On creation
`ContentView`        | `ConstraintLayout` | No
`Drawer`             | `ConstraintLayout` | No
`Canvas`             | `ConstraintLayout` | On creation
`Stack`              | `StackLayout`      | On creation, `StackLayout` instances only
`NavigationView`     | `null`             | No
`Page`               | `ConstraintLayout` | On creation
`TabFolder`          | `null`             | No
`Tab`                | `ConstraintLayout` | On creation
`CollectionView`     | `null`             | No

`NavigationView`, `TabFolder` and `CollectionView` do not support `layout` since their children can not be freely arranged.

## LayoutData Properties

All widgets have a property [`layoutData`](./api/Widget.md#layoutdata) that influence how the widget will be arranged. The exact syntax supported by `layoutData` is described [here](./types.md#layoutdatavalue), but most commonly it is set to a plain object containing any of these properties:

Property  | Type
----------|--------------------------------------
left      | [constraint/number](./types.md#constraintvalue)
top       | [constraint/number](./types.md#constraintvalue)
right     | [constraint/number](./types.md#constraintvalue)
bottom    | [constraint/number](./types.md#constraintvalue)
width     | [number](./types.md#dimension)
heigh     | [number](./types.md#dimension)
centerX   | [number](./types.md#offset)
centerY   | [number](./types.md#offset)
baseline  | [sibling](./types.md#siblingreferencevalue)

Example:
```js
widget.layoutData = {left: 10, top: 20};
```

All of these properties are also valid widget properties. When setting one of these the value of `layoutData` is updated accordingly:

```js
widget.left = 15;
console.log(widget.layoutData.top); // 15
```

Setting a field of `layoutData` directly is not allowed since the property always returns an immutable object of the type [`LayoutData`](./api/LayoutData.md).

```js
widget.layoutData.left = 15; // WRONG!!
```

 The advantage of using the `layoutData` property is that all currently set layout attributes not in the new `layoutData` object will be implicitly reset to `'auto'`. It also supports two string aliases for either centering or stretching the widget:

```js
widget.layoutData = 'fill';
// same as:
widget.layoutData = `{left: 0, top: 0, right: 0, bottom: 0}`;

widget.layoutData = 'center';
// same as:
widget.layoutData = `{centerX: 0, centerY: 0}`
```

How `layoutData` is interpreted depends on the layout manager of the parent and will be explained below.

> :point_right: The `layout` and `layoutData` values of the **same** widget instance are not relevant to each other. `layout` always deals with the size and position of a widgets children, while `layoutData` is relevant for a widgets own size and position.

## ConstraintLayout

This is the default layout used by `Composite` and most of its subclasses like `ContentView`. It supports all `layoutData` properties and each child can be arranged freely based on its own content, the parent's dimensions and its sibling's sizes and positions. It has no properties and thus there is never a reason to change the default instance.

### Properties "width" and "height"

The `width` and `height` properties define the [dimensions](./types.md#dimension) of the widget in DIPs. The value can be a positive float, `0` or `'auto'`. The default value is `'auto'`.

If `width` is `'auto`' (or not specified), the actual width is computed based on the position of the left and right edge defined by the `left` and `right` properties. If either `left` or `right` is also `'auto'`, the widget will shrink to its intrinsic width, i.e. the minimal width required to display its content.

The same logic applies to `height`/`top`/`bottom`.

### Properties "top", "right", "bottom", "left"

The `top`, `right`, `bottom` and `left` properties put a constraint on the the position of the child's edge. For detailed syntax see [ConstraintValue](./types.md#constraintvalue). The position may be given as an absolute (`number`) or relative (percentage) distance in relation to either the parent's opposing edge or a sibling's opposing edge.

Example Values  | Description
----------------|-------------
`'auto'` | No constraint on this edge, the size of the widget will determine its position. Default value.
`23` | 23 DIPs (device independent pixels) from the parent's opposing edge. This in addition to the parent's padding value for that edge.
`'50%'`<br/>`{percent:`&nbsp;`50}` | The distance from the parent's opposing edge will be 50% of the parent's width/height. This in addition to the parent's padding value for that edge.<br/>The string notation is shorter, but the object notation (second example) provides better type-safety in TypeScript.
`widget` | Attaches this edge to the opposing edge of the given sibling widget. Using a direct reference like this is often inconvenient, for that reason there are other ways to reference sibling widgets.
`'#foo'` | Attaches this edge to the opposing edge of the sibling widget with the id `'bar'`.
`'.bar'` | Attaches this edge to the opposing edge of the first sibling widget with a `'foo'` [class list entry](./api/Widget.md#classlist).
`'prev()'`<br/>`LayoutData.prev` | Attaches this edge to the opposing edge of the preceding sibling widget.<br/>The string notation is shorter, but the symbol reference (second example) provides better type-safety in TypeScript.
`'next()'`<br/>`LayoutData.next` | Attaches this edge to the opposing edge of the next sibling widget.<br/>The string notation is shorter, but the symbol reference (second example) provides better type-safety in TypeScript.
`'50%`&nbsp;`23'`<br/>`[{percent:`&nbsp;`50},`&nbsp;`23]`| The distance from the parent's opposing edge will be 50% of the parent's width/height **plus** a fixed offset in pixels. This in addition to the parent's padding value for that edge..<br/>The string notation is shorter, butt the array notation provides better type-safety in TypeScript.
`'#foo`&nbsp;`23'`<br/>`[foo,`&nbsp;`23]`| Attaches this edge to the opposing edge of the given sibling **plus** a fixed offset in DIPs. This in addition to the parent's padding value for that edge. For the second example the sibling `foo` is assumed to also have the id `'foo'`.
`'prev()`&nbsp;`23'`<br/>`[LayoutData.prev,`&nbsp;`23]`| Attaches this edge to the opposing edge of the preceding sibling  **plus** a fixed offset in DIPs. This in addition to the parent's padding value for that edge.

Sibling references are resolved dynamically, that is, if a referenced widget is added or removed later, the layout will adjust. When a sibling selector does not match any of the current siblings, it will be treated like an offset of zero.

### Properties "centerX" and "centerY"

These properties allow positioning a widget relative to its parent's center.

A numeric value ([may be 0 or negative](./types.md#offset)) for `centerX` defines the distance of this widget's vertical center from the parent's vertical center in DIPs. The default value is `'auto'`, which indicates that the `left` and `right` properties take priority.

The same logic applies for `centerY`/`top`/`bottom`.

### Property "baseline"

Defines the vertical position of the widget relative to another widget's text baseline. The value must be [a reference to a sibling widget](./types.md#siblingreferencevalue), for example via `'prev()'` or `'#id'`.
(For more example see left/right/top/bottom properties above.)

This property is only supported for widgets that contain text, i.e. both the actual and the referenced widget must be one of `TextView`, `TextInput`, or `Button`.

> :warning: For multiline texts, the platforms differ: Android aligns on the first line, iOS on the last line.

This property cannot be used in combination with either of `top`, `bottom`, and `centerY`.

### Z-Order

When the layout definition results in widgets overlapping one another, the z-order (drawing order) is defined by the order in which the widgets are appended to their parent. New widgets will be rendered on top of those widgets that have already been appended. This is the same order as given via the parent's [`children()`](./api/Composite.md#childrenselector) method, with the last child in the returned [`WidgetCollection`](./api/WidgetCollection.md) being placed on top of all other siblings.

This order can be changed via the [`insertAfter`](./api/widget.md#insertafterwidget) and [`insertBefore`](./api/widget.md#insertbeforewidget):

```js
child.insertAfter(parent.children().last()); // now drawn on top of all other children
```

In this example `child` may or may not already be a child of `parent`, the outcome will be the same.

The [`elevation`](./api/Widget.md#elevation) property overrides the default z-order. Any widget with an `elevation` of `1` will be drawn on top of any sibling with an `elevation` of `0`, regardless of child order.

### Fallback position

If all of `left`, `right`, and `centerX` are `'auto'`, the widget will be positioned as though `left` was set to `0`.

If all of `top`, `bottom`, `centerY` and `baseline` are `'auto'`, the widget will be positioned as though `top` was set to `0`.

Consequently, when there is no `layoutData` specified at all, the widget will be be displayed in the top left corner while still respecting the parent's padding.

### Example

```js
widget.layoutData = {
  left: 10,            // 10px from left edge
  top: ["#label", 10], // label's bottom edge + 10px, i.e. 10px below label
  right: ["30%", 10]   // 30% + 10px from right edge, i.e. at 70% - 10px
                       // no height or bottom given, i.e. auto-height
};
```

## StackLayout

The `StackLayout` is the default layout manager of `Stack`, but can also be used on `Composite`, `Canvas`, `Page`, `Tab` and `CollectionView`. It's a convenient way of arranging widgets in a vertical line, like a single-column table.

> :point_right: `StackLayout` is just a helper, everything it can do can also be achieved with `ConstraintLayout`.

There are three properties of `StackLayout` that can be set via constructor, all of which are also available on `Stack`. There properties are:

Property | Value | Description
---------|-------|------------
`padding` | [`number` or `object`](./types.md#boxdimensions) | As used in [ConstraintLayout](#constraintlayout).
`alignment` | `string`&nbsp;(`'left'`,&nbsp;`'centerX'`,&nbsp;`'stretchX'`&nbsp;or&nbsp;`'right'`) | Determines the horizontal placement of the children
`spacing` | `number` | Additional space to add between the children in device independent pixel

The order in which the children are arranged vertically corresponds to the order in which they were added to the composite, similar to [z-order](#z-order). The first child is placed at the very top of the composite, the second below that, etc. The last widget will be placed below all others and any remaining space of the composite (if it is higher than needed) will be left blank. The height of each child is based purely on its own content (intrinsic size).

The horizontal layout of each child is controlled by the `alignment` property. If it is set to `'left'`, `'right'` or `'centerX'`, all children will have their intrinsic width and placed at the left, right or horizontal center of the composite. If `alignment` is `'stretchX'`, all children will take all the available horizontal space. The composite's padding will be respected in all cases.

> :point_right: When `alignment` is set to `stretchX` the width of the composite needs to be determined by either its `width` property or its  `left` and `right` properties. It can not be computed based on the children's intrinsic size.

Examples:

```jsx
<Stack alignment='right' padding={4} spacing={24} >
  <TextView>lorem</TextView>
  <TextView>ipsum dolor</TextView>
  <TextView>sit amet</TextView>
</Stack>
```

```js
new Page({
  layout: new StackLayout({alignment: 'right', padding: 4, spacing: 24})
});
```

> :point_right: The `layoutData` of the children is ignored by `StackLayout`. However, this is subject to change.

## Bounds

The *actual*, computed onscreen bounds (position and dimension) of a widget are available as the read-only property [`bounds`](./api/Widget.md#bounds). Note that there is a short delay before changes to `layoutData` are reflected in `bounds`. To be notified about changes of `bounds` listen to the [`resize`](./api/Widget.md#resize) event.

The initial value of `bounds` until the first layout pass is `{left: 0, top: 0, width: 0, height: 0}`. That is also the value for any widget not attached to a parent.
