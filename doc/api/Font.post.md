## Related Types

### FontValue

* JavaScript Type: `tabris.Font`, `Object`, `string`
* TypeScript Type: `tabris.FontValue`

A `FontValue` describes a font by size, family, weight and style. This type allows various expressions that can all be used in place of a [`Font`](#class-font) instance for convenience. All API that accept these expressions will convert them to a `Font` object. (With the exception of `CanvasContext`.) Setting a FontValue property to null resets it to the default.

Generic **font size** is always given as DIP (device independent pixels), though the string shorthand expects `"px"` as a unit. It's still DIPs.

Generic **font families** are supported across all platforms: `"serif"`, `"sans-serif"`, `"condensed"` and `"monospace"`. These are available as static string properties of `Font`, e.g. `Font.serif`. These exist just to help with autocompletion. More families can be added via `app.registerFont`. If no family is given for a font the system default is used. If no font family is given the default system font will be used. The string `"initial"` represents the platform default.

Supported **font weights** are `"light"`, `"thin"`, `"normal"`, `"medium"`, `"bold"` and `"black"`. The default is `"normal"`

Supported **font styles** are `"italic"` and `"normal"`. The default is `"normal"`

In TypeScript you can import this type as a union with `import {FontValue} from 'tabris';` or use `tabris.FontValue`. [Type guards](https://www.typescriptlang.org/docs/handbook/advanced-types.html#type-guards-and-differentiating-types) for `FontValue` are available as [`Font.isFontValue`](#isfontvaluevalue) and [`Font.isValidFontValue`](#isvalidfontvaluevalue).

In addition to `Font` instances `FontValue` includes:

### FontLikeObject

* JavaScript Type: `Object`
* TypeScript Type: `tabris.FontLikeObject`

```ts
interface FontLikeObject {
  size: number;
  family?: string[];
  weight?: FontWeight;
  style?: FontStyle;
}
```

A plain object implementing the same properties as [`Font`](#class-font).

Examples:

```js
{size: 16, weight: 'bold'}
{size: 24, family: 'sans-serif', style: 'italic'}
```

### FontString

* JavaScript Type: `string`
* TypeScript Type: `tabris.FontString`

 As a string, a subset of the shorthand syntax known from CSS is used: `"font-style font-weight font-size font-family"`, where every value except size is optional. The size also need to have a `"px"` postfix. Multiple families may be given separated by commas. Families with spaces in their name need to be put in single or double quotes.

Examples:

```js
"bold 24px"
"12px sans-serif"
"italic thin 12px sans-serif"
"24px 'My Font', sans-serif"
"initial"
```
