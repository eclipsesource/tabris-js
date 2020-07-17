import {registerListenerAttributes, attributesWithoutListener, isListenerAttribute} from '../Listeners';
import {createSelectorArray, getSelectorSpecificity} from '../util-widget-select';
import WidgetCollection from '../WidgetCollection';
import {setterTargetType} from '../symbols';
import checkType from '../checkType';

/**
 * @typedef {import('./Composite').default} Composite
 * @typedef {import('../Widget').default} Widget
 * @typedef {'default'|'strict'} Mode
 * @typedef {symbol|string} Trigger
 * @typedef {{rules: object, mode: Mode, trigger: Trigger}} ApplyArgs
 */

/**
 * @param {object} config
 * @param {Composite} config.host
 * @param {boolean} config.protected
 * @param {IArguments} config.args
 * @returns {Composite}
 */
export function apply(config) {
  const host = config.host;
  if (config.args.length === 1
    && (typeof config.args[0] === 'string' || typeof config.args[0] === 'symbol')
  ) {
    triggerUpdate(config.args[0], host);
    return host;
  }
  const applyArgs = parseApplyArgs(config.args);
  const children = config.protected ? host._children() : host.children();
  const scope = new WidgetCollection(
    asArray(children).concat(host), {selector: '*', origin: host, deep: true}
  );
  applyRules(applyArgs, host, scope);
  setupTrigger(applyArgs, host, scope);
  return host;
}

/**
 * @param {ApplyArgs} applyArgs
 * @param {Composite} host
 * @param {WidgetCollection} scope
 */
function setupTrigger(applyArgs, host, scope) {
  const trigger = applyArgs.trigger;
  if (trigger === 'rules') {
    return;
  }
  const attached = getApplyAttributeObject(host);
  const updater = applyArgs.rules ? () => applyRules(applyArgs, host, scope) : null;
  if (typeof trigger === 'string' && isListenerAttribute(trigger)) {
    registerListenerAttributes(host, {[trigger]: updater}, attached);
  } else {
    attached[trigger] = updater;
  }
}

/**
 * @param {Trigger} trigger
 * @param {Composite} host
 */
function triggerUpdate(trigger, host) {
  const attached = getApplyAttributeObject(host);
  if (!attached[trigger]) {
    throw new Error(`No ruleset is associated with trigger "${String(trigger)}"`);
  }
  attached[trigger]();
}

/**
 * @param {ApplyArgs} applyArgs
 * @param {Composite} host
 * @param {WidgetCollection} scope
 */
function applyRules(applyArgs, host, scope) {
  const rules = applyArgs.rules instanceof Function
    ? checkType(applyArgs.rules(host), Object, 'returned rules')
    : applyArgs.rules;
  if (!rules) {
    return;
  }
  Object.keys(rules)
    .map(key => [createSelectorArray(key, host), rules[key]])
    .sort((rule1, rule2) => getSelectorSpecificity(rule1[0]) - getSelectorSpecificity(rule2[0]))
    .forEach(rule => {
      applyRule(applyArgs.mode, scope, (/** @type {any}*/(rule)), host);
    });
}

/**
 * @param {IArguments} args
 * @returns {ApplyArgs}
 */
function parseApplyArgs(args) {
  if (args.length === 0 || args.length > 2) {
    throw new Error(`Expected 1-2 arguments, got ${args.length}`);
  }
  const withOptions = args.length === 2;
  const {mode, trigger} = normalizeApplyOptions(withOptions ? args[0] : {});
  const rules = withOptions ? args[1] : args[0];
  if (typeof trigger !== 'symbol') {
    checkType(trigger, String, 'trigger');
  }
  checkType(rules, Object, {nullable: trigger !== 'rules'});
  if (mode !== 'default' && mode !== 'strict') {
    throw new Error(`Value "${mode}" is not a valid mode.`);
  }
  return {rules, mode, trigger};
}

/**
 * @param {string|object} value
 */
function normalizeApplyOptions(value) {
  const mode = typeof value === 'string' ? value : value.mode || 'default';
  const options = value instanceof Object ? value : {};
  const trigger = options.trigger || 'rules';
  return {mode, trigger};
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

/**
 * @param {Composite} host
 * @returns {object}
 */
function getApplyAttributeObject(host) {
  if (!host.jsxAttributes) {
    host.jsxAttributes = {};
  }
  if (!host.jsxAttributes.apply) {
    host.jsxAttributes.apply = {};
  }
  return host.jsxAttributes.apply;
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
