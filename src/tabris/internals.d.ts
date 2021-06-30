// global value/type declarations for use in internal modules only

declare var tabris: import('./Tabris').default;
declare var console: import('./Console').default;

type Auto = 'auto';
type ImageValue = ImageLikeObject|import('./Image').default|string|null;
type ColorArray = [number, number, number, number]|[number, number, number];
type ColorLikeObject = {red: number, green: number, blue: number, alpha?: number};
type ColorValue = ColorLikeObject|ColorArray|string|'initial'|null;
type FontWeight = 'black' | 'bold' | 'medium' | 'thin' | 'light' | 'normal';
type FontStyle = 'italic' | 'normal';
type FontLikeObject = {size: number, family?: string[], weight?: FontWeight, style?: FontStyle};
type FontValue = FontLikeObject|string|'initial'|null;
type PercentLikeObject = {percent: number};
type PercentValue = string|PercentLikeObject;
type LayoutDataValue = LayoutDataLikeObject|'center'|'stretch'|'stretchX'|'stretchY';
type LinearGradientValue = LinearGradientLikeObject|string|'initial'|null;
type Constructor<T> = new(...args: any[]) => T;
type SFC<T> = (attributes: object|null, children: any[]) => T;
type EventObjectBase = import('./EventObject').default;
type SiblingReference = import('./Widget').default | typeof import('./Constraint').default.next | typeof import('./Constraint').default.prev | string;
type SiblingReferenceValue = import('./Widget').default | typeof import('./Constraint').default.next | typeof import('./Constraint').default.prev | string;
type ConstraintArray = [SiblingReferenceValue | PercentValue, number];
type ConstraintArrayValue = [SiblingReference | PercentValue, number];
type PrevString = 'prev()';
type NextString = 'next()';
interface LayoutDataLikeObject {
    left?: Auto|ConstraintValue;
    right?: Auto|ConstraintValue;
    top?: Auto|ConstraintValue;
    bottom?: Auto|ConstraintValue;
    centerX?: Auto|number|true;
    centerY?: Auto|number|true;
    baseline?: Auto|SiblingReferenceValue|true;
    width?: Auto|null;
    height?: Auto|number;
}

// Simplified variant of the public "Properties" interface
type Props<T extends {set?: any}, U = Omit<T, 'set'>> = Partial<U> & {cid?: never};
type PropName<T extends {set?: any}> = keyof T & string;

type NativeProps = Record<string, unknown>;

type ImageLikeObject = {
  src: string | import('./Blob').default | import('./ImageBitmap').default,
  scale?: number|Auto,
  width?: number|Auto,
  height?: number|Auto
};

interface LayoutDataProperties {
    left?: Auto|import('./Constraint').default;
    right?: Auto|import('./Constraint').default;
    top?: Auto|import('./Constraint').default;
    bottom?: Auto|import('./Constraint').default;
    centerX?: Auto|number;
    centerY?: Auto|number;
    baseline?: Auto|SiblingReference;
    width?: Auto|number;
    height?: Auto|number;
}

type LinearGradientLikeObject = {
  colorStops: Array<ColorValue | [ColorValue, PercentValue]>,
  direction?: number | 'left' | 'top' | 'right' | 'bottom'
};

interface Bounds {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface Transformation {
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
  translationX?: number;
  translationY?: number;
  translationZ?: number;
}

type Selector<
  Candidate extends import('./Widget').default = import('./Widget').default,
  Result extends Candidate = Candidate
> = string | SelectorFunction<Candidate> | Constructor<Result> | SFC<Result>;

type SelectorFunction<Candidate extends import('./Widget').default>
  = (widget: Candidate, index: number, collection: import('./WidgetCollection').default) => boolean;

type ConstraintLikeObject = {
  reference: SiblingReferenceValue | PercentValue,
  offset?: number
}|{
  reference?: SiblingReferenceValue | PercentValue,
  offset: number
};

type ConstraintValue = import('./Constraint').default
  | ConstraintArrayValue
  | ConstraintLikeObject
  | number
  | PercentValue
  | SiblingReferenceValue
  | true;

interface AnimationOptions {
  delay?: number;
  duration?: number;
  easing?: 'linear'|'ease-in'|'ease-out'|'ease-in-out';
  repeat?: number;
  reverse?: boolean;
  name?: string;
}

type BoxDimensionsObject = {
  left?: number,
  right?: number,
  top?: number,
  bottom?: number
};

type BoxDimensions = number | string | BoxDimensionsObject;

type Converter<InType, OutType> = (value: InType) => OutType;

interface EventDefinition {
  native?: boolean;

  /**
   * Fire change events for the given property if this event fires
   */
  changes?: string;

  /**
   * Marks this as a native event that Observable.mutations() should pick up.
   * Defaults to true if "changes" is set.
   * Set to false if this is a change event that fires with a high
   * frequency and is related to layout, animation or scrolling.
   * Do NOT set to false if related to high-level user input such
   * as selection, text, checked or focused properties.
   */
  nativeObservable?: boolean;

  /**
   * When creating the change event, this is the field name on the
   * event object containing the new value. Can also be
   * a function extracting the value form the event object.
   * Falls back to the name of the property. Requires "changes".
   */
  changeValue?: string | Function;

  listen?: Array<(target: import('./NativeObject').default, listening: boolean) => void>;
}

interface EventDefinitions {
  [eventType: string]: EventDefinition | true;
}

interface PropertyChangedEvent<T,U> extends EventObjectBase {
  readonly value: U;
  readonly originalEvent: PropertyChangedEvent<unknown, unknown>;
}

type RawEvent = {
  target: object,
  type: string,
  dispatchObject?: import('./EventObject').default| null,
  value?: unknown
};

type TypeDef<ApiType, NativeType, Context extends object> = {
  /**
   * Function to convert any given value to one that matches the desired type.
   * May throw an error which results in a warning and the property to remain unchanged.
   * Runs in the context of the changing object, but should never have side-effects.
   */
  convert?: (value: any, context: Context) => ApiType,
  /**
   * Function to convert the final value to the value to required by the native client.
   * Not useful for readonly properties.
   */
  encode?: (v: ApiType, context: Context) => NativeType,
  /**
   * Function to convert a value given by the native client to the value used in public API.
   * Only useful for nocache properties.
   */
  decode?: (v: NativeType, context: Context) => ApiType
 };

interface PropertyDefinition<ApiType = any, NativeType = any, Context extends object = object> {
  /** Entry from property-types indicating the public API type */
  type: TypeDef<ApiType, NativeType, Context>;
  /** Default public API value */
  default: ApiType;
  /**
   * If set to true always get the value from the native bridge, which itself has a short term cache.
   * If not set to true the value will be requested from the native client only once (max).
   * Can not be combined with "default"
   **/
  nocache: boolean;
  /** A list of valid public API values, checked after conversion */
  choice: ApiType[]|undefined;
  /** If set to true and incoming value is "null" the converter is skipped */
  nullable: boolean;
  /** If set to true the value can never be set by public API */
  readonly: boolean;
  /**
   * If set to true no change events are supported.
   * The value can be set once, unless it's also 'readonly'
   */
  const: boolean;
}

type TabrisProp<ApiType, NativeType, Context extends Record<string, any>>
  = Omit<Partial<PropertyDefinition>, 'type'> & {type?:
    TypeDef<ApiType, NativeType, Context>
    | keyof import('./property-types').PropertyTypes
    | Constructor<any>
  };

interface PropertyDefinitions<Context extends object> {
  [property: string]: TabrisProp<any, unknown, Context>;
}

declare namespace global {
  export var console: import('./Console').default;
  export var localStorage: import('./Storage').default;
  export var secureStorage: import('./Storage').default;
  export var crypto: import('./Crypto').default;
  export var tabris: import('./Tabris').default;
}

declare namespace JSX {

  const jsxFactory: unique symbol;

  type JsxFactory = (
    this: object,
    type: new (...args: any[]) => any,
    attributes: object
  ) => any;

  export interface ElementClass {
    readonly jsxAttributes?: object;
    [JSX.jsxFactory]: JsxFactory;
  }

}
