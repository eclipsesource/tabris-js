## Related Types

### ConstraintValue

* JavaScript Type: `tabris.Constraint`, `tabris.Widget`, `tabris.Percent`, `Symbol`, `Array`, `Object`, `string`, `number` or `true`.
* TypeScript Type: `tabris.ConstraintValue`

A `ConstraintValue` represents a constraint on the layout of a widget that the parent uses to determine the position of one of its edges. This type allows various expressions that can all be used in place of a [`Constraint`](#class-constraint) instance for convenience. All API that accept these expressions will convert them to a `Constraint` object. (With the exception of `CanvasContext`.)

Every expression of `ConstraintValue` consists of a ${doc:SiblingReference} and/or an [`offset`](#offset) value.

In addition to `Constraint` instances `ConstraintValue` includes:

#### Offset-only constraints

Simply the [`Offset`](#offset) number by itself, a positive float including zero. A value of `true` is also accepted and treated like zero.

Examples:

```js
widget.left = 12.5;
widget.right = 8;
widget.top = 0;
widget.bottom = true;
```

#### Reference-only constraints

Either a ${doc:PercentValue} or a [`SiblingReferenceValue`](#siblingreferencevalue).

Examples:

```js
widget.left = '12%';
widget.right = 'prev()';
widget.top = new Percent(50);
widget.bottom = '#foo';
```

### ConstraintLikeObject

A plain object implementing the following interface:

* JavaScript Type: `Object`
* TypeScript Type: `tabris.ConstraintLikeObject`

```ts
interface ConstraintLikeObject {
  reference?: SiblingReferenceValue | PercentValue;
  offset?: Offset;
}
```

An object implementing the same properties as [`Constraint`](#class-constraint).

An instances of [`Constraint`](#class-constraint) is a valid `ConstraintLikeObject`, but `ConstraintLikeObject` is less strict:  The `reference` property can be a ${doc:PercentValue} or a [`SiblingReferenceValue`](#siblingreferencevalue), or can be omitted if  [`offset`](#offset) is given. Either of the two entries may be omitted, but not both.

Examples:

```js
widget.left = {reference: sibling, offset: 12};
widget.right = {reference: '23%', offset: 12};
widget.top = {reference: Constraint.prev};
widget.bottom = {offset: 12};
```

### ConstraintArrayValue

* JavaScript Type: `Array`
* TypeScript Type: `tabris.ConstraintArrayValue`

An array tuple in the format of `[reference, offset]`, where `reference` is either a ${doc:PercentValue} or a [`SiblingReferenceValue`](#siblingreferencevalue), and offset is an [`Offset`](#offset), i.e. a `number`.

Examples:

```js
widget.left = [sibling, 0];
widget.right = ['#foo', 0];
widget.top = [{percent: 23}, 12];
widget.bottom = [Constraint.prev, 12];
```

### ConstraintString

* JavaScript Type: `string`
* TypeScript Type: `tabris.ConstraintString`

This is often the most compact way to express a constraint, but it may not be the preferred way in TypeScript projects if type safety is a priority. The string consists of a space separated list of two values in the pattern of `'reference offset'`. The reference part may be of any string as accepted by [`SiblingReferenceValue`](#siblingreferencevalue) or ${doc:PercentValue}. The offset has to be a positive (including zero) float, just like [`Offset`](#offset).

Examples:

```js
widget.left = '.bar 0';
widget.right = '#foo 0'
widget.top = '23% 12';
widget.bottom = 'prev() 12';
```

### SiblingReference

* JavaScript Type: `tabris.Widget`, `Symbol`, `string`
* TypeScript Type: `tabris.SiblingReference`

A `SiblingReference` indicates a single sibling of a given Widget. Differs from the type [`SiblingReferenceValue`](#siblingreferencevalue) in that it does not include `'next()` and `'prev()'` as selectors strings. [It uses symbols instead](#siblingreferencesymbol). There are three variants of `SiblingReference`:

#### Sibling instance

* JavaScript Type: `Widget`
* TypeScript Type: `tabris.Widget`

Any widget instance that has the same parent.

#### SiblingSelectorString

* JavaScript Type: `string`
* TypeScript Type: `tabris.SiblingSelectorString`

A simple selector string of the format `'#Type'`, `'#id'`, `'.class'`. No child selectors. The first matching sibling is selected.

#### SiblingReferenceSymbol

* JavaScript Type: `Symbol`
* TypeScript Type: `tabris.SiblingReferenceSymbol`

The constants [`Constraint.prev`](#prev) and [`Constraint.next`](#next) (also available as [`LayoutData.prev`](#prev) and [`LayoutData.next`](#next)) may be used to point to the sibling directly before/after the reference widget in the parents children list.

### SiblingReferenceValue

* JavaScript Type: `tabris.Widget`, `Symbol`, `string`
* TypeScript Type: `tabris.SiblingReferenceValue`

Same as [`SiblingReference`](#siblingreference), but less strict in that it also allows the strings `'next()` and `'prev()'` in place of the [`prev`](#prev) and [`next`](#next) symbols.


### Offset

* JavaScript Type: `number`
* TypeScript Type: `tabris.Offset`, an alias for `number`

A positive or negative float, or 0, representing device independent pixels (DIP).

