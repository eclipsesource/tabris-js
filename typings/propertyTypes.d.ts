
/**
 * Represents pixel data of a `Canvas` widget.
 */
interface ImageData {

  /**
   * A one-dimensional array containing the data in the RGBA order, with integer values between 0 and 255 (included).
   */
  readonly data: Uint8ClampedArray;

  /**
   * The actual height of the ImageData, in pixels.
   */
  readonly width: number;

  /**
   * The actual height of the ImageData, in pixels.
   */
  readonly height: number;

}
/**
 * A plain object with following properties:
 *
 * **src**: *string*
 *    File system path, relative path or URL. The [data URI](https://en.wikipedia.org/wiki/Data_URI_scheme) scheme is also supported. Relative paths are resolved relative to 'package.json'. On Android the name of a bundled [drawable resource](https://developer.android.com/guide/topics/resources/drawable-resource.html) can be provided with the url scheme `android-drawable`, e.g. `android-drawable://ic_info_black`.
 *
 * **width**: *number | 'auto' (optional)*
 *    Image width in dip, extracted from the image file when missing or `'auto'`.
 *
 * **height**: *number | 'auto' (optional)*
 *    Image height in dip, extracted from the image file when missing or `'auto'`.
 *
 * **scale**: *number | 'auto' (optional)*
 *    Image scale factor, the image will be scaled down by this factor. The scale will be inferred from the image file name if it follows the pattern "@\<scale\>x", e.g. `"image@2x.jpg"`. The pattern is ignored if `scale`, `width` or `height` are set to a number or if `scale` is set to `"auto"`.
 */

type ImageLikeObject = {src: string, scale?: number|"auto", width?: number|"auto", height?: number|"auto"};

/**
 * Images can be specified as strings or Image/ImageLikeObject.
 *
 * An **Image** instance can be created using the **Image** constructor or using **Image.from**.
 *
 * The string shorthand `"image.jpg"` equals `{src: "image.jpg"}`.
 *
 * The scale can be part of the file name in the pattern of "@\<scale\>x", e.g. `"image@2x.jpg"`. The pattern is ignored if `scale`, `width` or `height` are set to a number or if `scale` is set to `"auto"`.
 */

type ImageValue = ImageLikeObject|Image|string|null;


type ColorArray = [number, number, number, number]|[number, number, number];
type ColorLikeObject = {red: number, green: number, blue: number, alpha?: number};

/**
 * Colors can be specified as strings, arrays or Color/Color-like objects.
 *
 * A **Color** instance can be created with the **Color** constructor or using **Color.from**.
 *
 * A **Color**-like object is a plain object with "red", "green", "blue" and optional "alpha" properties.
 * Example: **{red: 0, green: 127, blue: 255, alpha: 120}**
 *
 * A color array has consist of 3 or 4 numbers between (and including) 0 and 255,
 * i.e. **[red, green, blue, alpha]**. If omitted, alpha is 255.
 *
 * As a string the following formats can be used:
 * - **"#xxxxxx"**
 * - **"#xxx"**
 * - **"#xxxxxxxx"**
 * - **"#xxxx"**
 * - **"rgb(r, g, b)"** with **r**, **g** and **b** being numbers in the range 0..255.
 * - **"rgba(r, g, b, a)"** with **a** being a number in the range 0..1.
 * - a color name from the CSS3 specification.
 * - **"transparent"** sets a fully transparent color. This is a shortcut for **"rgba(0, 0, 0, 0)"**.
 * - **"initial"** resets the color to its (platform-dependent) default.
 *
 * Setting a ColorValue property to null also resets it to the default color.
 *
 * Type guards for `ColorValue` are available as **Color.isColorValue** and **Color.isValidColorValue**
 */
type ColorValue = ColorLikeObject|ColorArray|string|'initial'|null;

type FontWeight = 'black' | 'bold' | 'medium' | 'thin' | 'light' | 'normal';
type FontStyle = 'italic' | 'normal';
type FontLikeObject = {size: number, family?: string[], weight?: FontWeight, style?: FontStyle};
/**
 * Fonts can be specified as strings or Font/Font-like objects.
 *
 * A **Font** instance can be created with the **Font** constructor or using **Font.from**.
 *
 * A **Font**-like object is a plain object with "size" and optional "family", "weight" and "style" properties.
 * Example: **{size: 16, family: ['serif'], weight: 'bold', style: 'italic'}**
 *
 * Generic font families supported across all platforms are **"serif"**, **"sans-serif"**, **"condensed"** and **"monospace"**.
 * Supported font weights are **"light"**, **"thin"**, **"normal"**, **"medium"**, **"bold"** and **"black"**.
 *
 * As a string, the shorthand syntax known from CSS is used: **"[font-style] [font-weight] font-size [font-family[, font-family]*]"**. The font family may be omitted, in this case the default system font will be used. The value **"initial"** represents the platform default.
 */
type FontValue = FontLikeObject|string|'initial'|null;

type PercentLikeObject = {percent: number};
/**
 *
 * Percents can be specified as strings or Percent/Percent-like objects.
 *
 * A **Percent** instance can be created with the **Percent** constructor or using **Percent.from**.
 *
 * A **Percent**-like object is a plain object with a *percent* property with a number between and including 0 and 100.
 *
 * A percent string contains a number between and including 0 and 100 and and ends with `%`.
 *
 */

type PercentValue = string|PercentLikeObject;

/**
 * Defines how the widget should be arranged. When setting the layout of a widget using **LayoutData**, all currently set layout attributes not in the new LayoutData object will be implicitly reset to null (i.e. "not specified").
 */
type LayoutDataValue = LayoutDataLikeObject|'center'|'fill';

interface LayoutDataLikeObject {
    left?: 'auto'|ConstraintValue;
    right?: 'auto'|ConstraintValue;
    top?: 'auto'|ConstraintValue;
    bottom?: 'auto'|ConstraintValue;
    centerX?: 'auto'|Offset;
    centerY?: 'auto'|Offset;
    baseline?: 'auto'|SiblingReferenceValue;
    width?: 'auto'|Dimension;
    height?: 'auto'|Dimension;
}

interface LayoutDataProperties {
    left?: 'auto'|Constraint;
    right?: 'auto'|Constraint;
    top?: 'auto'|Constraint;
    bottom?: 'auto'|Constraint;
    centerX?: 'auto'|Offset;
    centerY?: 'auto'|Offset;
    baseline?: 'auto'|SiblingReference;
    width?: 'auto'|Dimension;
    height?: 'auto'|Dimension;
}

type LinearGradientLikeObject = {
  colorStops: (ColorValue | [ColorValue, PercentValue])[],
  direction?: number | 'left' | 'top' | 'right' | 'bottom'
}
/**
 * Linear gradients can be specified as strings or [LinearGradient](./LinearGradient.html) or
 * `LinearGradient`-like objects.
 *
 * An `LinearGradient` instance can be created using the `LinearGradient` constructor or using
 * `LinearGradient.from`.
 *
 * A `LinearGradient`-like object is a plain object with "colorStops" and optional "direction"
 * properties.
 * "colorStops" is an array containing atleast one `ColorValue` or `[ColorValue, PercentValue]`.
 * "direction" is a number in degrees or one of "left", "top", "right" and "bottom".
 *
 * As string, following CSS subset can be used:
 *
 * <color-stop> ::= <color> [ <number>% ]
 * <linear-gradient> ::= linear-gradient( [ <number>deg | to ( left | top | right | bottom ), ] <color-stop> { , <color-stop> } )
 */

type LinearGradientValue = LinearGradientLikeObject|string|'initial'|null;


/**
 * A Widget's bounds
 */
interface Bounds {

  /**
   * the horizontal offset from the parent's left edge in dip
   */
  left: number;

  /**
   * the vertical offset from the parent's top edge in dip
   */
  top: number;

  /**
   * the width of the widget in dip
   */
  width: number;

  /**
   * the height of the widget in dip
   */
  height: number;

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

type SelectorString = string;

/**
 * An expression or a predicate function to select a set of widgets.
 */
type Selector<T extends Widget = Widget> = SelectorString | SelectorFunction<T>;
type SelectorFunction<T extends Widget> = (widget: T, index: number, collection: WidgetCollection<T>) => boolean;

/**
 * A positive float, or 0, representing device independent pixels.
 */
type Dimension = number;
/**
 * A positive or negative float, or 0, representing device independent pixels.
 */
type Offset = number;

type PrevString = 'prev()';
type NextString = 'next()';

type SiblingReference = Widget | typeof LayoutData.next | typeof LayoutData.prev | SelectorString;

type SiblingReferenceValue = Widget | typeof LayoutData.next | typeof LayoutData.prev | SelectorString;

type ConstraintArray = [SiblingReferenceValue | PercentValue, Offset];

type ConstraintArrayValue = [SiblingReference | PercentValue, Offset];

type ConstraintLikeObject = {
  reference: SiblingReferenceValue | PercentValue;
  offset?: Offset;
}|{
  reference?: SiblingReferenceValue | PercentValue;
  offset: Offset;
};

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
type ConstraintValue = Constraint
  | ConstraintArrayValue
  | ConstraintLikeObject
  | Offset
  | PercentValue
  | SiblingReferenceValue;

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

/**
 * Represents dimensions on four edges of a box, as used for padding.
 */
interface BoxDimensions {

  /**
   * The left part, in dip.
   */
  left?: number;

  /**
   * The right part, in dip.
   */
  right?: number;

  /**
   * The top part, in dip.
   */
  top?: number;

  /**
   * The bottom part, in dip.
   */
  bottom?: number;

}

interface PropertyChangedEvent<T,U> extends EventObject<T>{
  readonly value: U
}

declare class ActionSheetItem {

  constructor(props?: Partial<Pick<ActionSheetItem, 'title' | 'image' | 'style'>>);

  readonly title: string;
  readonly image?: ImageValue;
  readonly style?: 'default'|'cancel'|'destructive';

  readonly [JSX.jsxFactory]: JSX.JsxFactory;
  readonly jsxProperties:  Partial<Pick<ActionSheetItem, 'title' | 'image' | 'style'>> & {children?: string};

}
