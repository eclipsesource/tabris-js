## Related Types

### Dimension

* JavaScript Type: `number`
* TypeScript Type: `tabris.Dimension`, an alias for `number`

A positive float, or 0, representing device independent pixels (DIP).

### BoxDimensions

* JavaScript Type: `Object` or `string` or `Array`.
* TypeScript Type: `tabris.BoxDimensions`

The bounds of a rectangle in relation to the four edges of a containing element in DIP (device independent pixel). By default it is a plain object implementing the following interface:

```ts
interface BoxDimensions {
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
}
```

All properties are [`dimension`](#dimension) and optional. Omitted properties are treated as `0`.

As a shorthand a list of four dimensions is also accepted. This follow the order of `[top, right, bottom, left]`, with missing entries being filled in by the entry of the opposing dimension. If only one entry is given it is used for all dimensions:

```js
[1, 2, 3, 4] // {top: 1, right: 2, bottom: 3, left: 4};
[1, 2, 3] // {top: 1, right: 2, bottom: 3, left: 2};
[1, 2] // {top: 1, right: 2, bottom: 1, left: 2};
[1] // {top: 1, right: 1, bottom: 1, left: 1};
```

A space separated string list is also accepted instead of an array, with or without `px` as a unit.

Examples:

```js
widget.padding = {left: 8, right: 8, top: 0, bottom: 0};
widget.padding = {left: 10, right: 10};
widget.padding = [0, 8];
widget.padding = [1, 10, 2, 10];
widget.padding = '10px 11px 12px 13px';
widget.padding = '10 11 12 13';
widget.padding = '0 8';
```

### Bounds

* JavaScript Type: `Object`
* TypeScript Type: `tabris.Bounds`

The bounds of a rectangle in relation to the top-left corner of a containing element in DIP (device independent pixel). This is a plain object implementing the following interface:

```ts
interface Bounds {
  left: number;
  top: number;
  width: number;
  height: number;
}
```

Explanation:

Property | Description
---------|--------------------------------------------------
left     | The horizontal offset from the parent's left edge
top      | The vertical offset from the parent's top edge
width    | The width of the widget
height   | The height of the widget

Example:

```js
const buttonRight = button.bounds.left + button.bounds.width;
```

### AnimationOptions

Options of the [`animate()`](#animateproperties-options) method. They have to implement the following interface:

```ts
interface AnimationOptions {
  delay?: number;
  duration?: number;
  easing?: "linear" | "ease-in" | "ease-out" | "ease-in-out";
  repeat?: number;
  reverse?: boolean;
  name?: string;
}
```

Each property has a default value if omitted:

Property   | Default            | Description
-----------|--------------------|------------
`delay`    | `0`                | Time until the animation starts in ms.
`duration` | (platform default) | Animation duration in ms.
`easing`   | `linear`           | Acceleration/deceleration curve
`repeat`   | `0`                | Number of times to repeat the animation. Use `Infinity` to repeat indefinitely.
`reverse`  | `true`             | Should the direction of the animation alternative on every repeat.
`name`     | `undefined`        | No effect, but will be given in animation events.

### Transformation

A Transformation is any object implementing the following interface:

```ts
interface Transformation {
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
  translationX?: number;
  translationY?: number;
  translationZ?: number;
}
```

Each property has a default value if omitted:

Property       | Default | Description
---------------|---------|------------
`rotation`     | `0`     |  Clock-wise rotation in radians.
`scaleX`       | `1`     |  Horizontal scale factor.
`scaleY`       | `1`     |  Vertical scale factor.
`translationX` | `0`     |  Horizontal translation (shift) in DIP (device independent pixels).
`translationY` | `0`     |  Vertical translation (shift) in DIP.
`translationZ` | `0`     |  Z-axis translation (shift) in DIP.

Example:

```js
{scaleX: 2, scaleY: 2, rotation: Math.PI * 0.75}
```
This transformation will make the widget twice as big and rotate it by 135&deg;.

### Properties&lt;Widget&gt;

The generic `Properties` type describes an object containing any number of key-value pairs corresponding to the settable properties of a given widget class. Such objects can be givin to a widget constructor or [`set`](./NativeObject.md#setproperties) method so set multiple widget properties simultaneously.

```ts
// Valid:
video.set({autoPlay: true, url: './myvideo.mp4'});
// Invalid: duration is read-only and can not be set!
video.set({duration: 1000});
```

The TypeScript interface always requires the widget class type parameter:

```ts
// Correct:
let props: Properties<Video> = {autoPlay: true, url: './myvideo.mp4'};
// Compiler Error: duration is read-only and can not be set!
props = {duration: 1000};
```

This interface is especially relevant when writing custom components in TypeScript, where it is needed to define the constructor:

```tsx
class CustomComponent extends Composite {

  constructor(properties: Properties<CustomComponent>) {
    super(properties);
  }

}
```


```ts
interface PropertyChangedEvent<TargetType, ValueType> extends EventObject<TargetType> {
  readonly value: ValueType
}
```
