import {registerListenerAttributes, attributesWithoutListener} from '../Listeners';
import {createSelectorArray, getSelectorSpecificity} from '../util-widget-select';
import WidgetCollection from '../WidgetCollection';
import {setterTargetType} from '../symbols';
import checkType from '../checkType';
/** @typedef {import('./Composite').default} Composite */
/** @typedef {import('../Widget').default} Widget */

/**
 * @param {object} config
 * @param {Composite} config.host
 * @param {boolean} config.protected
 * @param {IArguments} config.args
 * @returns {Composite}
 */
export function apply(config) {
  const applyArgs = parseApplyArgs(config.args);
  const host = config.host;
  const children = config.protected ? host._children() : host.children();
  const scope = new WidgetCollection(
    asArray(children).concat(host), {selector: '*', origin: host, deep: true}
  );
  const rules = applyArgs.rules instanceof Function ? applyArgs.rules(host) : applyArgs.rules;
  checkType(rules, Object, 'return value');
  Object.keys(rules)
    .map(key => [createSelectorArray(key, host), rules[key]])
    .sort((rule1, rule2) => getSelectorSpecificity(rule1[0]) - getSelectorSpecificity(rule2[0]))
    .forEach(rule => {
      applyRule(applyArgs.mode, scope, (/** @type {any}*/(rule)), host);
    });
  return host;
}

/**
 * @param {IArguments} args
 */
function parseApplyArgs(args) {
  if (args.length === 0 || args.length > 2) {
    throw new Error(`Expected 1-2 arguments, got ${args.length}`);
  }
  const withOptions = args.length === 2;
  const rules = withOptions ? args[1] : args[0];
  checkType(rules, Object);
  const {mode} = normalizeApplyOptions(withOptions ? args[0] : {});
  if (mode !== 'default' && mode !== 'strict') {
    throw new Error(`Value "${mode}" is not a valid mode.`);
  }
  return {rules, mode};
}

/**
 * @param {string|object} value
 */
function normalizeApplyOptions(value) {
  /** @type {object} */
  const options = typeof value === 'string' ? {mode: value} : value;
  if (!('mode' in options)) {
    options.mode = 'default';
  }
  return options;
}

/**
 * @param {'default'|'strict'} mode
 * @param {WidgetCollection} scope
 * @param {[[string], object]} rule
 * @param {Composite} host
 */
function applyRule(mode, scope, rule, host) {
  const [selector, attributes] = rule;
  /** @type {Function} */
  const targetType = attributes[setterTargetType];
  const matches = scope.filter(selector);
  if (mode === 'strict') {
    checkApplyMatches(selector, matches, host);
  }
  scope.filter(selector).forEach(widget => {
    if (targetType && !(widget instanceof targetType)) {
      throw new TypeError(
        `Can not set properties of ${targetType.name} on ${widget}`
      );
    }
    widget.set(attributesWithoutListener(attributes));
    registerListenerAttributes(widget, attributes);
  });
}

/**
 * @param {Array<string|Widget>} selector
 * @param {WidgetCollection} matches
 * @param {Composite} host
 */
function checkApplyMatches(selector, matches, host) {
  const selectorStr = selector.map(part => part === host ? ':host' : part).join(' > ');
  if (matches.length === 0) {
    throw new Error(`No widget matches the given selector "${selectorStr}"`);
  }
  const last = selector[selector.length - 1];
  if (last[0] === '#' && matches.length > 1) {
    throw new Error(`More than one widget matches the given selector "${selectorStr}"`);
  }
  const isHostSelector = selector.length === 1 && selector[0] === host;
  if (!isHostSelector && matches.length === 1 && matches[0] === host) {
    throw new Error(
      `The only widget that matches the given selector "${selectorStr}" is the host widget`
    );
  }
}

function asArray(value) {
  if (!value) {
    return [];
  }
  if (value instanceof WidgetCollection) {
    return value.toArray();
  }
  return value;
}
