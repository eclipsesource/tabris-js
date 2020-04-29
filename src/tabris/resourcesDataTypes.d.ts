type ResourcesConstructorOptions<ResourceType, RawType> = {
  data: ResourceRawData<RawType>,
  config?: ResourceConfig,
  base?: ResourceBaseData<ResourceType>,
  validator?: (value: any) => value is RawType,
  converter?: (raw: RawType) => ResourceType,
  type?: Constructor<ResourceType>
};

type ResourceBuildOptions<ResourceType> = {
  validator: (value: any) => value is ResourceType,
  type?: Constructor<ResourceType>
} | {
  validator?: (value: any) => value is ResourceType,
  type: Constructor<ResourceType>
};

type ResourceBuildConvertOptions<ResourceType, RawType> = {
  validator?: (value: any) => value is RawType,
  converter: (raw: RawType) => ResourceType,
  type?: Constructor<ResourceType>
};

type ResourceBuilderConstructorOptions<ResourceType, RawType> = {
  validator?: (value: any) => value is RawType,
  converter?: (raw: RawType) => ResourceType,
  type?: Constructor<ResourceType>
};

type ResourceRawData<RawType> = NeverResources
  & Selectable<RawType>
  & Partial<Record<keyof ResourceInlineConfig, never>>;

type ResourceDataWithConfig<RawType> = NeverResources
  & Selectable<RawType>
  & ResourceInlineConfig;

type ResourceConfig = {
  scaleFactor?: ScaleFactor,
  fallbackLanguage?: string
};

type ResourceInlineConfig = {
  $schema?: string,
  $scaleFactor?: ScaleFactor,
  $fallbackLanguage?: string
};

type ScaleFactor = 'nearest' | 'higher' | 'lower';

type Selectable<T> = T | {[key: string]: Selectable<T>} | undefined | {inherit: true} | {ref: string};

type ResourceBaseData<ResourceType> = NeverResources & {readonly [resourceName: string]: ResourceType | undefined};

type NamedResources<ResourceType, Keys extends string | symbol | number> = {
  [T in Exclude<Keys, ReservedResourceKeys>]: ResourceType
};

type ReservedResourceKeys = keyof NeverResources | 'toString' | 'valueOf' | symbol | number;

// TypeScript does now allow reg-ex checks,
// so these only catch the "worst" cases
type NeverResources = {
  _?: never,
  '#'?: never,
  '!'?: never,
  '*'?: never,
  '@'?: never,
  ' '?: never,
  'on'?: never
};
