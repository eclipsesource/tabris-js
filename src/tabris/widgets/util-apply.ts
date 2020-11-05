import {registerListenerAttributes, attributesWithoutListener, isListenerAttribute} from '../Listeners';
import {createSelectorArray, getSelectorSpecificity} from '../util-widget-select';
import WidgetCollection from '../WidgetCollection';
import {setterTargetType} from '../symbols';
import checkType from '../checkType';
import Observable from '../Observable';
import Composite from './Composite';
import Widget from '../Widget';

type Mode =  'default' | 'strict';
type Trigger = symbol | string;
type RuleSet = {
  [selector: string]: any
};

interface ApplyArgs {
 rules: RuleSet | RuleSet[] | Function;
 mode: Mode;
 trigger: Trigger;
}

interface ApplyConfig {
  host: Composite;
  protected: boolean;
  args: IArguments;
}

export function apply(config: ApplyConfig): Composite {
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
    // @ts-ignore TODO: migrate Widget and Composite to TypeScript to fix these
    asArray(children).concat(host), {selector: '*', origin: host, deep: true}
  );
  if (applyArgs.trigger !== '*') {
    // @ts-ignore
    applyRules(applyArgs, host, scope);
  }
  setupTrigger(applyArgs, host, scope);
  return host;
}

export function applyRules(
  applyArgs: ApplyArgs,
  host: Widget,
  scope: WidgetCollection,
  internal?: boolean
) {
  const rulesSets: RuleSet | RuleSet[] = applyArgs.rules instanceof Function
    ? checkType(applyArgs.rules(host), Object, 'returned rules')
    : applyArgs.rules;
  if (!rulesSets) {
    return;
  }
  (rulesSets instanceof Array ? rulesSets : [rulesSets]).forEach(rules => {
    if (rules[setterTargetType]) {
      return applyRule(
        applyArgs.mode,
        scope,
        [[rules[setterTargetType]], rules],
        host,
        !!internal
      );
    }
    Object.keys(rules)
      .map(key => [createSelectorArray(key, host), rules[key]] as any[])
      .sort((rule1, rule2) => getSelectorSpecificity(rule1[0]) - getSelectorSpecificity(rule2[0]))
      .forEach(rule => {
        applyRule(applyArgs.mode, scope, rule, host, !!internal);
      });
  });
}

function setupTrigger(applyArgs: ApplyArgs, host: Composite, scope: WidgetCollection) {
  const trigger = applyArgs.trigger;
  if (trigger === 'rules') {
    return;
  }
  const attached = getApplyAttributeObject(host);
  // @ts-ignore
  const updater = applyArgs.rules ? () => applyRules(applyArgs, host, scope) : null;
  if (typeof trigger === 'string' && isListenerAttribute(trigger)) {
    registerListenerAttributes(host, {[trigger]: updater}, attached);
  } else if (trigger === '*') {
    attached[trigger]?.unsubscribe();
    if (updater) {
      attached[trigger] = Observable.mutations(host).subscribe(updater);
    }
  } else {
    attached[trigger] = updater;
  }
}

function triggerUpdate(trigger: Trigger, host: Composite) {
  const attached = getApplyAttributeObject(host);
  if (!attached[trigger]) {
    throw new Error(`No ruleset is associated with trigger "${String(trigger)}"`);
  }
  attached[trigger]();
}

function parseApplyArgs(args: IArguments): ApplyArgs {
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

function normalizeApplyOptions(value: any) {
  const mode = typeof value === 'string' ? value : value.mode || 'default';
  const options = value instanceof Object ? value : {};
  const trigger = options.trigger || 'rules';
  return {mode, trigger};
}

function applyRule(
  mode: Mode,
  scope: WidgetCollection,
  rule: any[],
  host: Widget,
  internal: boolean
) {
  const [selector, attributes] = rule;
  checkType(attributes, Object, {name: 'rule attributes'});
  const targetType: Constructor<any> = attributes[setterTargetType];
  const matches = scope.filter(selector);
  if (mode === 'strict') {
    checkApplyMatches(selector, matches, host);
  }
  scope.filter(selector).forEach((widget: Widget) => {
    if (targetType && !(widget instanceof targetType)) {
      throw new TypeError(
        `Can not set properties of ${targetType.name} on ${widget}`
      );
    }
    widget.set(attributesWithoutListener(attributes));
    registerListenerAttributes(widget, attributes, internal ? {} : (widget as any).jsxAttributes);
  });
}

function checkApplyMatches(
  selector: Array<string|Widget>,
  matches: WidgetCollection,
  host: Widget
) {
  const selectorStr = selector.map(part => part === host ? ':host' : part).join(' > ');
  if (matches.length === 0) {
    throw new Error(`No widget matches the given selector "${selectorStr}"`);
  }
  const last = selector[selector.length - 1];
  if (typeof last === 'string' && last[0] === '#' && matches.length > 1) {
    throw new Error(`More than one widget matches the given selector "${selectorStr}"`);
  }
  const isHostSelector = selector.length === 1 && selector[0] === host;
  // @ts-ignore TODO: migrate WidgetCollection to fix this
  if (!isHostSelector && matches.length === 1 && matches[0] === host) {
    throw new Error(
      `The only widget that matches the given selector "${selectorStr}" is the host widget`
    );
  }
}

function getApplyAttributeObject(host: any): any {
  if (!host.jsxAttributes) {
    host.jsxAttributes = {};
  }
  if (!host.jsxAttributes.apply) {
    host.jsxAttributes.apply = {};
  }
  return host.jsxAttributes.apply;
}

function asArray(value: WidgetCollection | Widget[]): Widget[] {
  if (!value) {
    return [];
  }
  if (value instanceof WidgetCollection) {
    return value.toArray();
  }
  return value;
}
