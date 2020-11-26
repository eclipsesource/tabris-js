## Related Types

### LayoutDataValue

* JavaScript Type: `tabris.LayoutData`, `Object`
* TypeScript Type: `tabris.LayoutDataValue`

A `LayoutDataValue` provides layout information for a widget to be used its parent when determining its size and position. It allows various expressions that can all be used in place of a [`LayoutData`](#class-layoutdata) instance for convenience. All API that accepts these expressions will convert them to a `LayoutData` object.

In addition to `LayoutData` instances `LayoutDataValue` includes:

### LayoutDataLikeObject

* JavaScript Type: `Object`
* TypeScript Type: `tabris.LayoutDataLikeObject`

```ts
interface LayoutDataLikeObject {
  left?: 'auto' | ConstraintValue;
  right?: 'auto' | ConstraintValue;
  top?: 'auto' | ConstraintValue;
  bottom?: 'auto' | ConstraintValue;
  centerX?: 'auto' | Offset | true;
  centerY?: 'auto' | Offset | true;
  baseline?: 'auto' | SiblingReferenceValue | true;
  width?: 'auto' | Dimension;
  height?: 'auto' | Dimension;
}
```

A plain object implementing the same properties as [`LayoutData`](#class-layoutdata).

An instance of [`LayoutData`](#class-layoutdata) is a valid `LayoutDataLikeObject`, but in `LayoutDataLikeObject` all properties are optional and less strict. For example `left`, `top`, `right` and `bottom` accept ${doc:ConstraintValue} (e.g. a `number`) in place of a [`Constraint`](./Constraint.md) instance.

A value of `true` is also accepted for all fields except `width` and `height`. For `left`, `right`, `top`, `bottom`, `centerX` and `centerY` it means `0`. For `baseline` it means `'prev()'`.

Example:

```js
widget.layoutData = {
  baseline: 'prev()',
  left: 10,
  width: 100
};
widget.layoutData = {
  top: '25%',
  centerX: true
};
```

#### LayoutDataString

There are 4 alias strings that can be used in place of a LayoutData object:

Alias        | Equivalent
-------------|-----------------------------------------
`'center'`   | `{centerX: 0, centerY: 0}`
`'stretch'`  | `{left: 0, top: 0, right: 0, bottom: 0}`
`'stretchX'` | `{left: 0, right: 0}`
`'stretchY'` | `{top: 0, bottom: 0}`

```js
widget.layoutData = 'stretch';
```
