## Related Types

### LinearGradientValue

A `LinearGradientValue` specifies a set of colors, their relative position along a straight line, and the angle of that line. This describes a color gradient that can be drawn to fill any area, usually the background of a widget. This type allows various expressions that can all be used in place of a [`LinearGradient`](./api/LinearGradient.md) instance for convenience. All API that accept these expressions will convert them to a `LinearGradient` object.

In TypeScript you can import this type as a union with `import {LinearGradientValue} from 'tabris';` or use `tabris.LinearGradientValue`. [Type guards](https://www.typescriptlang.org/docs/handbook/advanced-types.html#type-guards-and-differentiating-types) for `LinearGradientValue` are available as [`LinearGradient.isLinearGradientValue`](#islineargradientvaluevalue) and [`LinearGradient.isValidLinearGradientValue`](#isvalidlineargradientvaluevalue).

The following are all valid `LinearGradientValue` types:

### LinearGradientLikeObject

An object implementing the following interface:

```ts
interface LinearGradientLikeObject {
  colorStops: Array<ColorValue | [ColorValue, PercentValue]>,
  direction?: number | 'left' | 'top' | 'right' | 'bottom'
}
```

An instances of [`LinearGradient`](#class-lineargradient) is a valid `LinearGradientLikeObject`, but `LinearGradientLikeObject` is less strict as it accepts more expressions for `colorStops` and `direction`.
Examples:

```js
{colorStops: [['red', '5%'], 'green'], direction: 'left'}
{colorStops: [['red', '5%'], 'green'], direction: 45}
```

### LinearGradient string

 As a string, a subset of the CSS syntax is used:

```css
<color-stop> ::= <color> [ <number>% ]
<linear-gradient> ::= linear-gradient(
    [ <number>deg | to ( left | top | right | bottom ), ]
    <color-stop> {, <color-stop>}
)
```

Examples:

```js
"linear-gradient(red, green)"
"linear-gradient(to left, red 5%, green)"
"linear-gradient(45deg, red 5%, green)"
```
