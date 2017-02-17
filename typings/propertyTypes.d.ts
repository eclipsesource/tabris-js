// TODO A plain string can be used as a shorthand, e.g. \`"image.jpg"\` equals \`{src: "image.jpg"}\`.
interface Image {

  /**
   * Image path or URL.
   */
  src?: string;

  /**
   * Image width, extracted from the image file when missing.
   */
  width?: number;

  /**
   * Image height, extracted from the image file when missing.
   */
  height?: number;

  /**
   * Image scale factor - the image will be scaled down by this factor.
   * Ignored when width or height are set.
   */
  scale?: number;
}

/**
 * Colors are specified as strings using one of the following formats:
 *
 * - **"#xxxxxx"**
 * - **"#xxx"**
 * - **"#xxxxxxxx"**
 * - **"#xxxx"**
 * - **"rgb(r, g, b)"** with **r**, **g** and **b** being numbers in the range 0..255.
 * - **"rgba(r, g, b, a)"** with **a** being a number in the range 0..1.
 * - a color name from the CSS3 specification.
 * - **"transparent"** sets a fully transparent color. This is a shortcut for **"rgba(0, 0, 0, 0)"**.
 * - **"initial"** resets the color to its (platform-dependent) default.
 */
type Color = string;

/**
 * Fonts are specified as strings using the shorthand syntax known from CSS, specifically **"[font-style] [font-weight] font-size [font-family[, font-family]*]"**. The font family may be omitted, in this case the default system font will be used. Generic font families supported across all platforms are **"serif"**, **"sans-serif"**, **"condensed"** and **"monospace"**. Supported font weights are **"light"**, **"thin"**, **"normal"**, **"medium"**, **"bold"** and **"black"**. The value **"initial"** represents the platform default.
 */
type Font = string;

/**
 * Defines how the widget should be arranged. When setting the layout of a widget using **LayoutData**, all currently set layout attributes not in the new LayoutData object will be implicitly reset to null (i.e. "not specified").
 */
interface LayoutData {
    left?: margin;
    right?: margin;
    top?: margin;
    bottom?: margin;
    centerX?: offset;
    centerY?: offset;
    baseline?: Widget;
    width?: dimension;
    height?: dimension;
}

interface EventObject<T> {

  /**
   * The object that received the event.
   */
  target: T;

}

/**
 * An event that is triggered when a property changes.
 */
interface ChangeEvent<T, P> extends EventObject<T> {

  /**
   * The new value of the changed property.
   */
  value: P;

}

/**
 * An event that is triggered when a widget has been resized.
 */
interface ResizeEvent<T> extends EventObject<T> {

  /**
   * The horizontal offset from the parent's left edge in dip.
   */
  left: number;

  /**
   * The vertical offset from the parent's top edge in dip.
   */
  top: number;

  /**
   * The width of the widget in dip.
   */
  width: number;

  /**
   * the height of the widget in dip.
   */
  height: number;

}

/**
 * An event that is triggered by a gesture.
 */
interface GestureEvent<T> extends EventObject<T> {

  /**
   * The gesture state, depends on the type of the gesture.
   */
  state: string,

  /**
   * An array of touch coordinates relative to the origin coordinates of the widget.
   */
  touches: {x: number, y: number}[],

  /**
   * Current touch coordinates relative to the coordinates of the first touch.
   * Only for pan gestures.
   */
  translation?: {x: number, y: number},

  /**
   * Current touch velocity in pixels per second.
   * Only for pan gestures.
   */
  velocity?: {x: number, y: number}

}

interface TouchEvent<T> extends EventObject<T> {

  /**
   * number of milliseconds since the start of the app
   */
  time: number;

  /**
   * An array of touch objects for all current touches. Since multiple touches are currently not supported, this array has always one element.
   */
  touches: {x: number, y: number}[];

}

interface AnimationEvent<T> extends EventObject<T> {

  /**
   * The time until the animation starts in ms.
   */
  delay: number;

  /**
   * The animation duration in ms.
   */
  duration: number;

  /**
   * One of `linear`, `ease-in`, `ease-out`, `ease-in-out`.
   */
  easing: 'linear'|'ease-in'|'ease-out'|'ease-in-out';

  /**
   * The number of times to repeat the animation.
   */
  repeat: number;

  /**
   * Whether to alternate the direction of the animation on every repeat.
   */
  reverse: boolean;

}

/**
 * A Widget's bounds
 */
interface Bounds {

  /**
   * the horizontal offset from the parent's left edge in dip
   */
  left?: number;

  /**
   * the vertical offset from the parent's top edge in dip
   */
  top?: number;

  /**
   * the width of the widget in dip
   */
  width?: number;

  /**
   * the height of the widget in dip
   */
  height?: number;

}

interface Transformation {

  /**
   * Clock-wise rotation in radians. Defaults to \`0\`.
   */
   rotation?: number;

  /**
   * Horizontal scale factor. Defaults to \`1\`.
   */
  scaleX?: number;

  /**
   * Vertical scale factor. Defaults to \`1\`.
   */
  scaleY?: number;

  /**
   * Horizontal translation (shift) in dip. Defaults to \`0\`.
   */
  translationX?: number;

  /**
   * Vertical translation (shift) in dip. Defaults to \`0\`.
   */
  translationY?: number;

  /**
   * Z-axis translation (shift) in dip. Defaults to \`0\`. Android 5.0+ only.
   */
  translationZ?: number;

}

/**
 * An expression or a predicate function to select a set of widgets.
 */
type Selector = string | SelectorFunction;
type SelectorFunction = (widget: Widget) => boolean;

/**
 * A positive float, or 0, representing device independent pixels.
 */
type dimension = number;
/**
 * A positive or negative float, or 0, representing device independent pixels.
 */
type offset = number;

/**
 * Distance to a parent's or sibling's opposing edge in one of these formats:
 * - **offset** the distance from the parent's opposing edge in device independent pixels
 * - **percentage** the distance from the parent's opposing edge in percent of the parent's width
 * - **Widget** attach this edge to the given siblings's opposing edge
 * - **"selector"**
 * - **"prev()"** Same as above, but as space-separated string list instead of array
 * - **"selector offset"**
 * - **"prev() offset"**
 * - **[Widget, offset]** the distance from the given widget's opposing edge in pixel
 * - **"Widget, offset"**Same as above, but as space-separated string list instead of array.
 * - **[percentage, offset]** the distance from the parent's opposing edge in percent of the parent's width plus a fixed offset in pixels
 * - **"percentage offset"** Same as above, but as space-separated string list instead of array
 * - **[selector, offset]**
 * - **["prev()", offset]**
 */
type margin = any;

interface AnimationOptions {

  /**
   * Time until the animation starts in ms, defaults to 0.
   */
  delay?: number;

  /**
   * Duration of the animation in ms.
   */
  duration?: number;

  /**
   *  Easing function applied to the animation.
   */
  easing?: "linear"|"ease-in"|"ease-out"|"ease-in-out";

  /**
   *  Number of times to repeat the animation, defaults to 0.
   */
  repeat?: number;

  /**
   *  If true, alternates the direction of the animation on every repeat.
   */
  reverse?: boolean;

  /**
   * no effect, but will be given in animation events.
   */
  name?: string;
}
