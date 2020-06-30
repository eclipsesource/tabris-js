import {processResources, isInherit} from './util-resources';
import ResourceBuilder from './ResourceBuilder';
import checkType from './checkType';

const RESOURCE_REGEX = /^[a-z][a-zA-Z][a-zA-Z0-9]+$/ ;

const SCALE_FACTOR = ['nearest', 'lower', 'higher'];

const CONFIG_DEFAULTS = {
  scaleFactor: SCALE_FACTOR[1],
  fallbackLanguage: 'en'
};

const ALLOWED_OPTIONS = ['data', 'config', 'base', 'converter', 'type', 'validator'];

/**
 * @template {unknown} ResourceType
 * @template {unknown} RawType
 */
export default class Resources {

  /**
   * @template ResourceType
   * @template RawType
   * @param {ResourceBuildConvertOptions<ResourceType, RawType>} options
   * @returns {ResourceBuilder<ResourceType, RawType>}
   */
  static build(options) {
    if (arguments.length !== 1) {
      throw new Error(`Expected 1 parameter, got ${arguments.length}`);
    }
    return new ResourceBuilder(options);
  }

  /**
   * @param {ResourcesConstructorOptions<ResourceType, RawType>} options
   */
  constructor(options) {
    validateArguments(arguments);
    const result = wrap(this, options.type);
    return Object.assign(result, processResources(
      options.data,
      options.base || {},
      Object.assign({}, CONFIG_DEFAULTS, options.config),
      createRawTypeCheck(options.validator, options.type),
      options.converter || (v => v)
    ));
  }

}

/**
 * @param {IArguments} args
 */
function validateArguments(args) {
  if (args.length !== 1) {
    throw new Error(`Expected 1 parameter, got ${args.length}`);
  }
  const options = args[0];
  checkType(options, Object, {name: 'parameter 1'});
  if (!(options.data instanceof Object)) {
    checkType(options.data, Object, {name: 'option "data"'});
  }
  checkType(options.converter, Function, {name: 'option "converter"', nullable: true});
  if (('type' in options) && options.type != null && !(options.type instanceof Function && options.type.prototype)) {
    throw new Error(`Expected option "type" to be a constructor, got ${typeof options.type}`);
  }
  checkType(options.base, Object, {name: 'option "base"', nullable: true});
  Object.keys(options).forEach(key => {
    if (ALLOWED_OPTIONS.indexOf(key) === -1) {
      throw new Error(`Unknown option "${key}"`);
    }
  });
  validateResourceNames(Object.keys(options.data));
  validateResourceNames(Object.keys(options.base || {}));
  validateConfig(options.config);
}

/**
 * @param {string[]} names
 */
function validateResourceNames(names) {
  for (const name of names) {
    if (name === '$') { continue; }
    if (!RESOURCE_REGEX.test(name)) {
      throw new Error(`Invalid resource name ${name}`);
    }
  }
}

/**
 * @param {ResourceConfig} config
 */
function validateConfig(config) {
  if (typeof config === 'undefined') {
    return;
  }
  checkType(config, Object, {name: 'option "config"'});
  for (const key of Object.keys(config)) {
    if (!(key in CONFIG_DEFAULTS)) {
      throw new Error(`Unknown configuration key "${key}"`);
    }
  }
  if ('scaleFactor' in config && SCALE_FACTOR.indexOf(config.scaleFactor) === -1) {
    throw new Error(`Invalid scaleFactor "${config.scaleFactor}"`);
  }
}

/**
 * @param {Resources<any, any>} resources
 * @param {Constructor<any>=} type
 */
function wrap(resources, type) {
  return new Proxy(resources, {
    set(target, property, value) {
      if (type) {
        checkType(value, type, {name: 'data', nullable: true});
      }
      target[property] = value;
      return true;
    }
  });
}

/**
 * @param {(value: any) => boolean} validator
 * @param {Constructor<any>=} type
 */
function createRawTypeCheck(validator, type) {
  const typeName = type ? type.name : 'resource';
  return rawValue => {
    if (!isInherit(rawValue) && validator && !validator(rawValue)) {
      const entry = typeof rawValue === 'string' ? rawValue : JSON.stringify(rawValue);
      throw new Error(
        `data entry "${entry}" is not a valid selector or raw ${typeName} type`
      );
    }
  };
}
