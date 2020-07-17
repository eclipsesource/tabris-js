import Widget from '../Widget';
import {registerListenerAttributes, attributesWithoutListener} from '../Listeners';
import NativeObject from '../NativeObject';
import {createSelectorArray, getSelectorSpecificity} from '../util-widget-select';
import Layout, {ConstraintLayout} from '../Layout';
import WidgetCollection from '../WidgetCollection';
import {omit} from '../util';
import {JSX} from '../JsxProcessor';
import {toXML, toValueString, hint} from '../Console';
import {setterTargetType} from '../symbols';
import checkType from '../checkType';

export default class Composite extends Widget {

  get layout() {
    return this._layout;
  }

  set layout(value) {
    hint(this, 'Can not set read-only property "layout"');
  }

  append() {
    this._checkDisposed();
    const accept = (/** @type {Widget} */ widget) => {
      if (!(widget instanceof NativeObject)) {
        throw new Error(`Cannot append non-widget ${toValueString(widget)} to ${this}`);
      }
      if (widget === this) {
        throw new Error(`Cannot append widget ${this} to itself`);
      }
      widget._setParent(this);
    };
    if (arguments[0] instanceof WidgetCollection) {
      arguments[0].toArray().forEach(accept);
    } else if (Array.isArray(arguments[0])) {
      arguments[0].forEach(accept);
    } else {
      Array.prototype.forEach.call(arguments, accept);
    }
    return this;
  }

  find(selector) {
    return new WidgetCollection(this.children(), {selector, origin: this, deep: true});
  }

  /**
   * @param {object|'default'|'strict'} arg1
   * @param {object=} arg2
   */
  apply(arg1, arg2) {
    const {sheet, mode} = getApplyArgs(arguments);
    const scope = new WidgetCollection(
      asArray(this.children()).concat(this), {selector: '*', origin: this, deep: true}
    );
    return this._apply(mode, sheet, scope);
  }

  /** @param {any=} selector */
  children(selector) {
    return this._children(selector);
  }

  set(props) {
    if (('children' in props) && !(props.children instanceof Function)) {
      throw new Error('You may not override children with a non-function');
    }
    return super.set(props);
  }

  _nativeCreate(properties) {
    super._nativeCreate(omit(properties || {}, ['layout']));
    this._initLayout(properties);
  }

  /**
   * @param {any} props
   */
  _initLayout(props = {}) {
    if (!('layout' in props)) {
      Object.defineProperty(
        this, '_layout', {enumerable: false, writable: false, value: ConstraintLayout.default}
      );
    } else if (props.layout) {
      Object.defineProperty(
        this, '_layout', {enumerable: false, writable: false, value: props.layout}
      );
    } else {
      Object.defineProperty(
        this, '_layout', {enumerable: false, writable: false, value: null}
      );
    }
    if (this._layout) {
      this._checkLayout(this._layout);
      this._layout.add(this);
    }
  }

  _children(selector) {
    return new WidgetCollection(this.$children, {selector, origin: this});
  }

  _find(selector) {
    return new WidgetCollection(this._children(), {selector, origin: this, deep: true});
  }

  /**
   * @param {object|'default'|'strict'} arg1
   * @param {object|WidgetCollection=} arg2
   * @param {WidgetCollection=} arg3
   */
  _apply(arg1, arg2, arg3) {
    const {scope, sheet, mode} = getApplyArgs(arguments);
    let widgetCollection = scope;
    if (!widgetCollection) {
      widgetCollection = new WidgetCollection(
        asArray(this._children()).concat(this), {selector: '*', origin: this, deep: true}
      );
    }
    Object.keys(sheet)
      .map(key => [createSelectorArray(key, this), sheet[key]])
      .sort((rule1, rule2) => getSelectorSpecificity(rule1[0]) - getSelectorSpecificity(rule2[0]))
      .forEach(rule => {
        applyRule(mode, widgetCollection, (/** @type {any}*/(rule)), this);
      });
    return this;
  }

  get _nativeType() {
    return 'tabris.Composite';
  }

  // eslint-disable-next-line no-unused-vars
  _acceptChild(child) {
    return true;
  }

  _checkLayout(value) {
    if (value && !(value instanceof Layout)) {
      throw new Error(`${toValueString(value)} is not an instance of Layout`);
    }
  }

  _addChild(child, index) {
    if (!this._acceptChild(child)) {
      throw new Error(`${toValueString(child)} could not be appended to ${this}`);
    }
    if (!this.$children) {
      Object.defineProperties(this, {
        $children: {enumerable: false, writable: true, value: []}
      });
    }
    if (typeof index === 'number') {
      this.$children.splice(index, 0, child);
    } else {
      index = this.$children.push(child) - 1;
    }
    this._scheduleRenderChildren();
    super._trigger('addChild', {child, index});
  }

  _removeChild(child) {
    if (this.$children) {
      const index = this.$children.indexOf(child);
      if (index !== -1) {
        this.$children.splice(index, 1);
        this._scheduleRenderChildren();
        super._trigger('removeChild', {child, index});
      }
    }
  }

  _release() {
    if (this.$children) {
      const children = this.$children.concat();
      for (let i = 0; i < children.length; i++) {
        children[i]._dispose(true);
      }
      this.$children = undefined;
    }
    if (this._layout) {
      this._layout.remove(this);
    }
    super._release();
  }

  _getXMLContent() {
    const content = super._getXMLContent();
    for (let i = 0; i < (this.$children || []).length; ++i) {
      content.push(this.$children[i][toXML]().split('\n').map(line => '  ' + line).join('\n'));
    }
    return content;
  }

  _scheduleRenderChildren() {
    tabris.once('layout', this.$flushChildren, this);
  }

  $flushChildren() {
    if (this.$children) {
      this._nativeSet('children', this.$children.filter(notExcluded).map(toCid));
    }
  }

  /** @this {import("../JsxProcessor").default} */
  [JSX.jsxFactory](Type, attributes) {
    const children = this.getChildren(attributes);
    const normalAttributes = this.withoutChildren(attributes);
    const result = super[JSX.jsxFactory](Type, normalAttributes);
    if (children && children.length) {
      result.append(children);
    }
    return result;
  }

}

/**
 * @param {IArguments} args
 */
function getApplyArgs(args) {
  if (args.length === 0) {
    throw new Error('Expected 1-2 arguments, got 0');
  }
  const withScope = args[args.length - 1] instanceof WidgetCollection;
  const withOptions = withScope ? args.length === 3 : args.length === 2;
  if (typeof args[0] === 'string' && args.length === 1) {
    throw new Error('Expected 2 arguments, got 1');
  }
  const {mode} = normalizeApplyOptions(withOptions ? args[0] : {});
  if (mode !== 'default' && mode !== 'strict') {
    throw new Error(`Value "${mode}" is not a valid mode.`);
  }
  const sheet = withOptions ? args[1] : args[0];
  checkType(sheet, Object);
  const scope = withOptions && args.length === 3 ? args[2] : args[1];
  return {scope, sheet, mode};
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

function asArray(value) {
  if (!value) {
    return [];
  }
  if (value instanceof WidgetCollection) {
    return value.toArray();
  }
  return value;
}

function toCid(widget) {
  return widget.cid;
}

function notExcluded(widget) {
  return !widget.excludeFromLayout;
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
