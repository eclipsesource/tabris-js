// NOTE:
// This module shall only contain dependency free,
// pure function so it can also be used at build time.

const refKey = Symbol();

/**
 * @template {unknown} RawType
 * @template {unknown} ResourceType
 * @param {import('./Resources').default} base
 * @param {ResourceConfig} config
 * @param {((value: any) => void)} typeCheck
 * @param {(value: any) => any} converter
 * @returns {import('./Resources').default<ResourceType>}
 */
export function processResources(data, base, config, typeCheck, converter) {
  const resources = Object.assign({}, base);
  /** @type {{[key: string]: string}} */
  const references = {};
  for (const key in data) {
    const value = selectResource(data[key], config, tabris.device, typeCheck);
    if (isInherit(value)) {
      if (!(key in resources)) {
        throw new Error(`Resource "${key}" resolved to "inherit: true", but "${key}" does not exist in base object`);
      }
    } else if (value instanceof Object && refKey in value) {
      references[key] = value[refKey];
    } else {
      resources[key] = converter(value);
    }
  }
  return Object.assign(resources, resolveReferences(resources, references));
}

export function isInherit(value) {
  if (!(value instanceof Object) || value.constructor !== Object) {
    return false;
  }
  const keys = Object.keys(value).map(str => str.toLowerCase());
  if (keys.indexOf('inherit') === -1) {
    return false;
  }
  if (keys.length === 1 && value.inherit === true) {
    return true;
  }
  throw new Error('Invalid inherit syntax ' + JSON.stringify(value));
}

/**
 * @template {unknown} ResourceType
 * @param {import('./Resources').default<ResourceType>} resources
 * @param {{[key: string]: string}} references
 * @returns {import('./Resources').default<ResourceType>}
 */
function resolveReferences(resources, references) {
  /** @type {typeof resources} */
  const result = {};
  for (const key in references) {
    const ref = references[key];
    if (ref in resources) {
      result[key] = resources[ref];
    } else {
      if (ref in references) {
        throw new Error(`"${key}": References can not be nested`);
      } else {
        throw new Error(`"${key}": Can not resolve reference "${ref}"`);
      }
    }
  }
  return result;
}

/**
 * Applies the selector logic to a single resource definition object.
 * @template {unknown} RawType
 * @param {Selectable<RawType>} selectable
 * @param {ResourceConfig} resourceConfig
 * @param {object} targetConfig
 * @param {'android'|'ios'|'Android'|'iOS'} targetConfig.platform
 * @param {number} targetConfig.scaleFactor
 * @param {string} targetConfig.language
 * @param {((value: any) => void)=} checkRawType
 * @returns {RawType | {inherit: true} | {[key: symbol]: string}}
 */
function selectResource(selectable, resourceConfig, targetConfig, checkRawType) {
  if (isPlatformSelector(selectable)) {
    return selectResource(
      getValue(selectable, targetConfig.platform),
      resourceConfig,
      targetConfig,
      checkRawType
    );
  } else if (isScaleSelector(selectable)) {
    return selectResource(
      getNearbyValue(selectable, targetConfig.scaleFactor, resourceConfig.scaleFactor),
      resourceConfig,
      targetConfig,
      checkRawType
    );
  } else if (isLangSelector(selectable, resourceConfig.fallbackLanguage)) {
    return selectResource(
      getLocalValue(selectable, targetConfig.language, resourceConfig.fallbackLanguage),
      resourceConfig,
      targetConfig,
      checkRawType
    );
  } else if (isReference(selectable)) {
    return {[refKey]: getValue(selectable, 'ref')};
  }
  checkHasNoInvalidKeys(selectable);
  if (checkRawType) {
    checkRawType(selectable);
  }
  return /** @type {RawType}*/(selectable);
}

function isReference(value) {
  if (!(value instanceof Object) || value.constructor !== Object) {
    return false;
  }
  const keys = Object.keys(value).map(str => str.toLowerCase());
  if (keys.indexOf('ref') === -1) {
    return false;
  }
  if (keys.length === 1 && typeof value.ref === 'string') {
    return true;
  }
  throw new Error('Invalid reference syntax ' + JSON.stringify(value));
}

function isPlatformSelector(value) {
  if (!(value instanceof Object)) {
    return false;
  }
  const keys = Object.keys(value).map(str => str.toLowerCase());
  const hasAndroid = keys.indexOf('android') !== -1;
  const hasIOs = keys.indexOf('ios') !== -1;
  if (!hasAndroid && !hasIOs) {
    return false;
  }
  if (hasAndroid && hasIOs && keys.length === 2) {
    return true;
  }
  throw new Error('Invalid platform selector ' + JSON.stringify(value));
}

const SCALE_REGEX = /^([0-9]+|[0-9]\.[0-9]+)x$/;
const SCALE_REGEX_STRICT = /^([1-9]|[1-9]\.[0-9]+)x$/;

function isScaleSelector(value) {
  if (!(value instanceof Object)) {
    return false;
  }
  const keys = Object.keys(value).map(str => str.toLowerCase());
  const scaleKeys = keys.filter(key => SCALE_REGEX.test(key));
  if (scaleKeys.length === 0) {
    return false;
  }
  if ((keys.length === scaleKeys.length)
    && !hasDuplicates(keys)
    && scaleKeys.every(key => SCALE_REGEX_STRICT.test(key))
  ) {
    return true;
  }
  throw new Error('Invalid scale selector ' + JSON.stringify(value));
}

const SHORT_LANG_REGEX = /^[a-zA-Z][a-zA-Z][a-zA-Z]?$/;
const LONG_LANG_REGEX = /^[a-zA-Z][a-zA-Z][a-zA-Z]?-[a-zA-Z0-9][-a-zA-Z0-9]+$/;
const LANG_LIKE_REGEX = /^[a-zA-Z][-a-zA-Z0-9]$/;

/**
 * @param {string} key
 */
function isLangKey(key) {
  return SHORT_LANG_REGEX.test(key) || LONG_LANG_REGEX.test(key);
}

/**
 * @param {any} value
 * @param {string} fallback
 */
function isLangSelector(value, fallback) {
  if (!(value instanceof Object)) {
    return false;
  }
  const keys = Object.keys(value).map(str => str.toLowerCase());
  const langLikeKeys = keys.filter(key => LANG_LIKE_REGEX.test(key));
  if (langLikeKeys.length === 0) {
    return false;
  }
  if (!value[fallback.toLowerCase()] && !value[fallback.toLowerCase().split('-')[0]]) {
    throw new Error(
      `Missing entry for fallback language (currently "${fallback}") `
      + 'in selector '
      + JSON.stringify(value)
    );
  }
  const langKeys = keys.filter(isLangKey);
  if ((keys.length === langKeys.length) && !hasDuplicates(keys)) {
    return true;
  }
  throw new Error('Invalid language selector ' + JSON.stringify(value));
}

const RESERVED = [
  '', 'small', 'normal', 'large', 'xlarge', 'horizontal', 'vertical', 'landscape', 'portrait',
  'debug', 'production', 'phone', 'tablet', 'browser', 'online', 'offline', 'wifi', 'cell',
  'other', 'long', 'notlong', 'ldrtl', 'ldltr'
];

const INVALID = [/^mcc[0-9]/, /^[a-z0-9]+dpi$/, /^!/, /[*:._$@#]/];

function checkHasNoInvalidKeys(resource) {
  if (resource instanceof Object && resource.constructor === Object) {
    Object.keys(resource).forEach(key => {
      if (typeof key === 'string' && RESERVED.indexOf(key.toLowerCase().trim()) !== -1) {
        throw new Error(`Resource uses reserved property name "${key}".`);
      }
      INVALID.forEach(regex => {
        if (regex.test(key)) {
          throw new Error(`Resource uses reserved property name "${key}".`);
        }
      });
    });
  }
}

/**
 * @param {object} source
 * @param {string} name
 */
function getValue(source, name) {
  const lowerCaseName = name.toLowerCase();
  for (const key in source) {
    if (key.toLowerCase() === lowerCaseName) {
      return source[key];
    }
  }
}

/**
 * @param {object} selectable
 * @param {number} approx
 * @param {ResourceConfig['scaleFactor']} strategy
 */
function getNearbyValue(selectable, approx, strategy) {
  const candidates = Object.keys(selectable)
    .map(key => /** @type {[number, any]} */([parseFloat(key), selectable[key]]))
    .sort((a, b) => a[0] - b[0]);
  const last = candidates.length - 1;
  for (let i = 0; i < last; i++) {
    const lower = candidates[i];
    const higher = candidates[i + 1];
    if ((approx >= lower[0]) && (approx < higher[0])) {
      if (strategy === 'lower') {
        return lower[1];
      } else if (strategy === 'higher') {
        return higher[1];
      } else {
        return (approx - lower[0]) < (higher[0] - approx) ? lower[1] : higher[1];
      }
    }
  }
  return candidates[last][1];
}

/**
 * @param {object} source
 * @param {string} language
 * @param {string} fallback
 */
function getLocalValue(source, language, fallback) {
  const map = {};
  Object.keys(source).forEach(key => map[key.toLowerCase()] = source[key]);
  return map[language.toLowerCase()]
    || map[language.toLowerCase().split('-')[0]]
    || map[fallback.toLowerCase()]
    || map[fallback.toLowerCase().split('-')[0]];
}

/**
 * @param {any[]} arr
 * @returns boolean
 */
function hasDuplicates(arr) {
  for (let i = 0; i < arr.length; i++) {
    if (arr.indexOf(arr[i], i + 1) !== -1) {
      return true;
    }
  }
  return false;
}
