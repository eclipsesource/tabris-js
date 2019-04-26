import NativeObject from "./NativeObject";

type Converter<InType, OutType> = {(value: InType): OutType};

type TabrisType = 'any'
  | 'boolean'
  | 'string'
  | 'number'
  | 'natural'
  | 'integer'
  | 'function'
  | 'shader'
  | 'ColorValue'
  | 'LinearGradientValue'
  | 'FontValue'
  | 'ImageValue'
  | 'boxDimensions'
  | 'layoutData'
  | 'edge'
  | 'dimension'
  | 'sibling'
  | 'bounds'
  | 'NativeObject'
  | 'opacity'
  | 'transform';

type PropertyType<ApiType, NativeType> = TabrisType
  | ['nullable', TabrisType]
  | ['choice', ApiType[]]
  | {encode?: Converter<ApiType, NativeType>, decode?: Converter<NativeType, ApiType>};

interface PropertyDefinition<ApiType = any, NativeType = any> {
  type?: PropertyType<ApiType, NativeType>;
  default?: ApiType;
  nocache?: boolean;
  readonly?: boolean;
  const?: boolean;
  set?: (this: NativeObject, name: string, value: ApiType) => void;
  get?: (this: NativeObject, name: string) => ApiType;
}

interface PropertyDefinitions {
  [property: string]: PropertyDefinition | TabrisType
}

interface EventDefinition {
  native?: boolean;

  /**
   * Fire change events for the given property if this event fires
   */
  changes?: string;

  /**
   * When creating the change event, this is the field name on the
   * event object containing the new value. Can also be
   * a function extracting the value form the event object.
   * Falls back to the name of the property. Requires "changes".
   */
  changeValue?: string | Function;

  listen?: Array<(target: NativeObject, listening: boolean) => void>;
}

interface EventDefinitions {
  [eventType: string]: EventDefinition | true;
}
