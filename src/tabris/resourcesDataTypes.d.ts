type ResourcesConstructorOptions<ResourceType, RawType> = {
  data: ResourceRawData<RawType>,
  config?: ResourceConfig,
  base?: ResourceBaseData<ResourceType>,
  validator?: (value: any) => value is RawType,
  converter?: (raw: RawType) => ResourceType,
  type?: Constructor<ResourceType>
};

type ResourceRawData<RawType> = NeverResources & Selectable<RawType>;

type ResourceConfig = {
  scaleFactor?: ScaleFactor,
  fallbackLanguage?: string
};

type ScaleFactor = 'nearest' | 'higher' | 'lower';

type Selectable<T> = T | {[key: string]: Selectable<T>} | undefined;

type ResourceBaseData<ResourceType> = NeverResources & {readonly [resourceName: string]: ResourceType};

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
