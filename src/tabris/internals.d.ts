type Converter<InType, OutType> = {(value: InType): OutType};

type TabrisType = 'any'
  | 'boolean'
  | 'string'
  | 'number'
  | 'natural'
  | 'integer'
  | 'function'
  | 'shader'
  | 'color'
  | 'font'
  | 'boxDimensions'
  | 'image'
  | 'layoutData'
  | 'edge'
  | 'dimension'
  | 'sibling'
  | 'bounds'
  | 'proxy'
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
  set?: (name: string, value: ApiType) => void;
  get?: (name: string) => ApiType;
}

interface PropertyDefinitions {
  [property: string]: PropertyDefinition | TabrisType
}
