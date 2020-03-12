## Related Types

### ColorValue

* JavaScript Type: `tabris.Color`, `Object`, `Array`, `string`
* TypeScript Type: `tabris.ColorValue`

A `ColorValue` represents a 24 bit color, plus an alpha channel for opacity. This type allows various expressions that can all be used in place of a [`Color`](#class-color) instance for convenience. All API that accept these expressions will convert them to a `Color` object. (With the exception of `CanvasContext`.) Setting a ColorValue property to null resets it to the default.

In TypeScript you can import this type as a union with `import {ColorValue} from 'tabris';` or use `tabris.ColorValue`. [Type guards](https://www.typescriptlang.org/docs/handbook/advanced-types.html#type-guards-and-differentiating-types) for `ColorValue` are available as [`Color.isColorValue`](#iscolorvaluevalue) and [`Color.isValidColorValue`](#isvalidcolorvaluevalue).

In addition to `Color` instances `ColorValue` includes:

### ColorLikeObject

* JavaScript Type: `Object`
* TypeScript Type: `tabris.ColorLikeObject`

 ```ts
interface ColorLikeObject {
  red: number;
  green: number;
  blue: number;
  alpha?: number;
}
```

A plain object implementing the same properties as [`Color`](#class-color).

Examples:

```js
{red: 255, green: 255, blue: 255}
{red: 255, green: 255, blue: 255, alpha: 200}
```

### ColorArray

* JavaScript Type: `Array`
* TypeScript Type: `tabris.ColorArray`

An array in the shape of `[red, green, blue, alpha]`. All entries should be natural number between (and including) 0 and 255. If omitted, alpha is 255.

Examples:

```js
[255, 0, 0]
[255, 0, 0, 200]
```

### ColorString

* JavaScript Type: `string`
* TypeScript Type: `tabris.ColorString`

Any string in the following format:

Pattern              | Description
---------------------|------------
`"#rrggbb"`          | Hexadecimal rgb, with each value being between and including `00` and `ff`.
`"#rgb"`             | Hexadecimal rgb, with each value being between and including `0` and `f`.
`"#rrggbbaa"`        | Hexadecimal rgba, with each value being between and including `00` and `ff`.
`"#rgba"`            | Hexadecimal rgba, with each value being between and including `0` and `f`.
`"rgb(r, g, b)"`     | With `r`, `g` and `b` being numbers in the range 0..255.
`"rgba(r, g, b, a)"` | With `a` being a number in the range 0..1.
`"transparent"`      | Sets a fully transparent color. Same as `rgba(0, 0, 0, 0)`.
`"initial"`          | Resets the color to its (platform-dependent) default. Same as `null`.

[Color names](https://www.w3.org/TR/css-color-3/#html4) from the CSS3 specification are also accepted. They are available as static string properties of `Color`, e.g. `Color.lime`. These exist just to help with autocompletion.

Examples:

```js
"#f00"
"#ff0000"
"#ff000080" // 50% opacity red
"#ff06" // 40% opacity yellow
"rgb(255, 0, 0)"
"rgba(255, 0, 0, 0.8)"
"red"
"initial" // same as null
```
