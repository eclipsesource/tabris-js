---
---
# Layout

Tabris.js uses the native platform capabilities to layout UIs. As display density (pixels per inch) widely varies among mobile devices the pixel measures in Tabris.js are always expressed as [Device Independent Pixels](https://en.wikipedia.org/wiki/Device_independent_pixel) (DIP). The density of a device's display can be accessed by `tabris.device.scaleFactor`. The value represents the number of native pixels per Device Independent Pixel.

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

`NavigationView`, `TabFolder` and `CollectionView` do not support `layout` since their children can not be freely arranged. Same goes for the `ContentView` instance attached to `AlertDialog`.

## LayoutData Properties

All widgets have a property [`layoutData`](./api/Widget.md#layoutdata) that influences how the widget will be arranged. The exact syntax supported by `layoutData` is described [here](./types.md#layoutdatavalue), but most commonly it is assigned a plain object containing any of these properties:

Property  | Type
----------|--------------------------------------
left      | [constraint or number](./types.md#constraintvalue)
top       | [constraint or number](./types.md#constraintvalue)
right     | [constraint or number](./types.md#constraintvalue)
bottom    | [constraint or number](./types.md#constraintvalue)
width     | [number](./types.md#dimension)
heigh     | [number](./types.md#dimension)
centerX   | [number](./types.md#offset)
centerY   | [number](./types.md#offset)
baseline  | [sibling](./types.md#siblingreferencevalue)

Example:
```js
widget.layoutData = {left: 10, top: 20};
```

All of these properties are also available as widget properties that delegate to the `layoutData`. When setting one of these the value of `layoutData` is updated accordingly:

```js
widget.left = 15;
console.log(widget.layoutData.top); // 15
```

Setting a field of `layoutData` directly is *not* allowed since the property always returns an immutable object of the type [`LayoutData`](./api/LayoutData.md).

```js
widget.layoutData.left = 15; // WRONG!!
```

 The main difference of setting the `layoutData` property as opposed to the individual delegates is that it implicitly resets all layout properties to `'auto'`. It can therefore be used to completely change the layout of a widget without any regard to the current one.

How `layoutData` is interpreted depends on the layout manager of the parent and will be explained below.

> :point_right: The `layout` and `layoutData` values of the **same** widget instance are not relevant to each other. `layout` deals with the size and position of a widgets *children*, while `layoutData` is relevant to a widgets *own* size and position.

### LayoutData Shorthand

LayoutData supports some [string aliases](./types.md#layoutdata-string) for either centering or stretching the widget:

```js
widget.layoutData = 'center';
// equivalent to:
widget.layoutData = `{centerX: 0, centerY: 0}`

widget.layoutData = 'stretch';
// equivalent to:
widget.layoutData = `{left: 0, top: 0, right: 0, bottom: 0}`;

widget.layoutData = 'stretchX';
// equivalent to:
widget.layoutData = `{left: 0, right: 0}`

widget.layoutData = 'stretchY';
// equivalent to:
widget.layoutData = `{top: 0, bottom: 0}`
```

Used as a JSX element `Composite` also supports a special shorthand syntax. It allows setting the alias string directly in the tag, *omitting the attribute*:

```jsx
widget = <Composite stretch/>;
// equivalent to:
widget = <Composite layoutData='stretch'/>;
```

In general JSX allows setting an attribute to `true` by *omitting the value*. This is useful since all layoutData properties except `width` and `height` can be set to `true`:

```jsx
widget = <Composite centerX baseline/>;
// same as:
widget = <Composite centerX={true} baseline={true}/>;
// equivalent to:
widget = <Composite centerX={0} baseline='prev()'/>;
```

## Properties "bounds" and "absoluteBounds"

The `layoutData` property always reflects the values set by the application, *not* the actual outcome of the layout process. For example, if `width` is left on `'auto'` it will always be `'auto'`, not visible on-screen widget width. However, that value can be obtained via the read-only properties [`bounds`](./types.md#bounds) and [`absoluteBounds`](./types.md#bounds). They provide the position and size of any widget in relation to its parent or assigned contentView respectively.

Note that there is a short delay needed for the layout calculation before changes to `layoutData` are reflected in `bounds`. You can be notified of any changes of `bounds` by listening to the [`resize`](/api/Widget.md#resize) or [`boundsChanged`](/api/Widget.md#boundschanged) events. (They are fired at the same time.) However, there is no event to get notified when the `absoluteBounds` property changes, specifically its `top` and `left` values may change without a `resize` event.

The initial value of `bounds` until the first layout pass is `{left: 0, top: 0, width: 0, height: 0}`. That is also the value for any widget not attached to a parent.

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
`0` | Directly attached the parent's opposing edge, or as close as the padding allows.
`true` | Same as `0`.
`'50%'` or<br/>`{percent:`&nbsp;`50}` | The distance from the parent's opposing edge will be 50% of the parent's width/height. This in addition to the parent's padding value for that edge.<br/>The string notation is shorter, but the object notation (second example) provides better type-safety in TypeScript.
`fooWidget` | Attaches this edge to the opposing edge of the given sibling widget. Using a direct reference like this is often inconvenient, for that reason there are other ways to reference sibling widgets.
`'#foo'` | Attaches this edge to the opposing edge of the sibling widget with the id `'foo'`.
`'.bar'` | Attaches this edge to the opposing edge of the first sibling widget with a `'bar'` [class list entry](./api/Widget.md#classlist).
`'prev()'` or<br/>`LayoutData.prev` | Attaches this edge to the opposing edge of the preceding sibling widget. Siblings with `excludeFromLayout` set to `true` will be skipped.<br/>The string notation is shorter, but the symbol reference (second example) provides better type-safety in TypeScript.
`'next()'` or<br/>`LayoutData.next` | Attaches this edge to the opposing edge of the next sibling widget. Siblings with `excludeFromLayout` set to `true` will be skipped.<br/>The string notation is shorter, but the symbol reference (second example) provides better type-safety in TypeScript.
`'50%`&nbsp;`23'` or<br/>`[{percent:`&nbsp;`50},`&nbsp;`23]`| The distance from the parent's opposing edge will be 50% of the parent's width/height **plus** a fixed offset in pixels. This in addition to the parent's padding value for that edge..<br/>The string notation is shorter, butt the array notation provides better type-safety in TypeScript.
`'#foo`&nbsp;`23'` or<br/>`[foo,`&nbsp;`23]`| Attaches this edge to the opposing edge of the given sibling **plus** a fixed offset in DIPs. This in addition to the parent's padding value for that edge. For the second example the sibling `foo` is assumed to also have the id `'foo'`.
`'prev()`&nbsp;`23'` or<br/>`[LayoutData.prev,`&nbsp;`23]`| Attaches this edge to the opposing edge of the preceding sibling (or the first preceding sibling with `excludeFromLayout` set to `false`) **plus** a fixed offset in DIPs. This in addition to the parent's padding value for that edge.

Sibling references are resolved dynamically, that is, if a referenced widget is added or removed later, or its `excludeFromLayout` property changes, the layout will adjust. When a sibling selector does not match any of the current siblings, it will be treated like an offset of zero.

### Properties "centerX" and "centerY"

These properties allow positioning a widget relative to its parent's center.

A numeric value ([may be 0 or negative](./types.md#offset)) for `centerX` defines the distance of this widget's vertical center from the parent's vertical center in DIPs. The default value is `'auto'`, which indicates that the `left` and `right` properties take priority. Can also be set to `true`, which is treated like `0`.

The same logic applies for `centerY` in relation to `top`/`bottom`.

### Property "baseline"

Defines the vertical position of the widget relative to another widget's text baseline. The value must be [a reference to a sibling widget](./types.md#siblingreferencevalue), for example via `'prev()'` or `'#id'`. (For more examples see left/right/top/bottom properties above.) Can also be set to `true`, which is treated like `'prev()'`.

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

The `StackLayout` is the default layout manager of the `Stack` widget, but can also be used on `Composite`, `Canvas`, `Page` and `Tab`. It's a convenient way of arranging widgets in a vertical line, like a single-column table.

> :point_right: `StackLayout` is just a helper, everything it can do can also be achieved with `ConstraintLayout`.

`StackLayout` has two properties, both of which can be set only via its own constructor or the constructor of `Stack`. They are:

Property | Type | Default Value | Description
---------|------|---------------|------------
`alignment` | `string`&nbsp;(`'left'`,&nbsp;`'centerX'`,&nbsp;`'stretchX'`&nbsp;or&nbsp;`'right'`) | `'left'` | Determines the horizontal placement of the children
`spacing` | `number` | `0` | The default vertical distance between the children in device independent pixel

The order in which the children are arranged **vertically** corresponds to the order in which they are appended to the composite. The first child is placed at the very top of the composite, the second below that, etc. The last widget will be placed below all others and any remaining space of the composite (if it is higher than needed) will be left blank. The order may be changed at any time by re-inserting a child at any given position using [`insertAfter`](./api/widget.md#insertafterwidget) and [`insertBefore`](./api/widget.md#insertbeforewidget).


The **horizontal** layout of each child is controlled by the `alignment` property. If it is set to `'left'`, `'right'` or `'centerX'`, all children will have their intrinsic width and placed at the left, right or horizontal center of the composite. If `alignment` is `'stretchX'`, all children will take all the available horizontal space. The composite's padding will be respected in all cases.

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

The `layoutData` of children managed by a `StackLayout` is interpreted differently from `ConstraintLayout`:

### Properties "width" and "height"

Like in `ConstraintLayout`, the `width` and `height` properties define the [dimensions](./types.md#dimension) of the widget in DIPs.

If `width`/`height` is `'auto`' (or not specified) the widget will shrink to its intrinsic width/height. However, if `width` is `'auto'` and the `alignment` of `StackLayout` is `'stretchX'` the width of the widget is determined by the width of the parent.

### Properties "left", "right" and "centerX"

If all of `left`, `right` and `centerX` are set to `'auto'` (or not specified), the horizontal position of the widget is controlled by the `alignment` of `StackLayout`. If one of more of them are set to any other value they all behave like they do when controlled by `ConstraintLayout`. The `alignment` is ignored in that case.

### Properties "top" and "bottom"

In a stack layout these properties control the distance to the preceding (for `top`) and following sibling (`bottom`) in DIPs. If set to `'auto'`, the `'spacing'` of `StackLayout` is determining the distance. If both `top` and `bottom` are set to a numeric value the widget will be **stretched vertically**, assuming it is the first widget to have that configuration and there is enough horizontal space available. The [LayoutData alias](#layoutdata-shorthand) `'stretchY'` has the same effect, as it stands for `{top: 0, bottom: 0}`:

```js
new Stack().append(
  new TextView({text: 'Top'}),
  new TextView({top: 0, bottom: 0, text: 'Stretch'}),
  new TextView({text: 'Bottom'}),
);
```

Same code, but using JSX and layoutData shorthand syntax:

```jsx
<Stack>
  <TextView>Top</TextView>
  <TextView stretchY>Stretch</TextView>
  <TextView>Bottom</TextView>
</Stack>
```

### Properties "baseline" and "centerY"

These properties are not supported by `StackLayout`.
