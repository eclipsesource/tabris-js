## Related Types

### PercentValue

* JavaScript Type: `tabris.Percent`, `Object`, `string`
* TypeScript Type: `tabris.PercentValue`

Represents a percentage. This type includes various expressions that can all be used in place of a [`Percent`](#class-percent) instance for convenience. All APIs that accept these expressions will convert them to a `Percent` object.

In TypeScript you can import this type as a union with `import {PercentValue} from 'tabris';` or use `tabris.PercentValue`. A [Type guard](https://www.typescriptlang.org/docs/handbook/advanced-types.html#type-guards-and-differentiating-types) for `PercentValue` is available as  [`Percent.isValidPercentValue`](#isvalidpercentvaluevalue).

In addition to `Percent` instances `PercentValue` includes:

### PercentLikeObject

* JavaScript Type: `Object`
* TypeScript Type: `tabris.PercentLikeObject`

```ts
export interface PercentLikeObject {
  percent: number;
}
```

A plain object in the format of `{percent: number}`, where `100` presents 100%.

Examples:

```js
widget.left = {percent: 50};
```

### PercentString

A number followed by `%`.

Example: `'50%'`
