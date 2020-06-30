import Resources from './Resources';
import checkType from './checkType';

/**
 * @template {any} ResourceType
 * @template {any} RawType
 */
export default class ResourceBuilder {

  /**
   * @param {ResourceBuilderConstructorOptions<ResourceType, RawType>} options
   */
  constructor(options) {
    validateOptions(options);
    this.validator = options.validator || null;
    this.type = options.type || null;
    this.converter = options.converter || null;
    Object.freeze(this);
  }

  /**
   * @template {ResourceBaseData<ResourceType>} Base
   * @template {ResourceDataWithConfig<RawType>} Data
   * @param {Base} obj1
   * @param {Data=} obj2
   * @returns {NamedResources<ResourceType, keyof Base & Data>}
   */
  from(obj1, obj2) {
    const withBase = arguments.length === 2;
    const base = (/** @type {ResourceBaseData<ResourceType>}*/ (withBase ? obj1 : {}));
    const dataWithConfig = (/** @type {ResourceDataWithConfig<RawType>} */ (withBase ? obj2 : obj1));
    /** @type {ResourceConfig} */
    const config = {};
    /** @type {ResourceRawData<RawType>} */
    const data = {};
    Object.keys(dataWithConfig).forEach(key => {
      if (CONFIG_KEYS[key]) {
        config[key.slice(1)] = dataWithConfig[key];
      } else if (key !== '$schema') {
        data[key] = dataWithConfig[key];
      }
    });
    /** @type {ResourcesConstructorOptions<ResourceType, RawType>} */
    const options = Object.assign({data, base, config}, this);
    // @ts-ignore
    return new Resources(options);
  }

}

const CONFIG_KEYS = {
  $scaleFactor: true,
  $fallbackLanguage: true
};

/**
 * @param {any} options
 */
function validateOptions(options) {
  checkType(options, Object, {name: 'parameter 1'});
  if (options.converter || options.type || options.validator) {
    return;
  }
  throw new Error('At least one option required');
}
