import {select} from './util-widget-select';
import {JSX} from './JsxProcessor';

/** @typedef {import('./Widget').default} Widget */
/** @typedef {Widget[]|WidgetCollection} Widgets */
/** @typedef {string|Function} Selector */

export default class WidgetCollection {

  /**
   * @param {Widgets=} collection
   * @param {{selector?: Selector, deep?: boolean, origin?: Widget|WidgetCollection}} internals
   */
  constructor(collection, {selector, deep, origin} = {}) {
    if (selector && !origin) {
      throw new Error('WidgetCollection can not be constructed with an selector but no origin');
    }
    const arr = collection instanceof WidgetCollection ? collection.toArray() : collection;
    this._host = getHost(origin);
    /** @type {Widget[]} */
    this._array = select(arr, selector || '*', deep, origin instanceof WidgetCollection ? origin : this);
    for (let i = 0; i < this._array.length; i++) {
      this[i] = this._array[i];
    }
  }

  get length() {
    return this._array.length;
  }

  get host() {
    return this._host;
  }

  first(selector) {
    if (selector) {
      return this.filter(selector).first();
    }
    return this._array[0];
  }

  last(selector) {
    if (selector) {
      return this.filter(selector).last();
    }
    return this._array[this._array.length - 1];
  }

  only(selector) {
    if (selector) {
      return this.filter(selector).only();
    }
    if (this._array.length !== 1) {
      throw new Error('Expected exactly one match, but found '  + this.length);
    }
    return this._array[0];
  }

  toArray() {
    return this._array.concat();
  }

  forEach(callback) {
    this._array.forEach((value, index) => callback(value, index, this));
  }

  indexOf(needle) {
    return this._array.indexOf(needle);
  }

  includes(needle) {
    return this._array.indexOf(needle) !== -1;
  }

  filter(selector) {
    return new WidgetCollection(this._array, {selector, origin: this});
  }

  parent() {
    const result = [];
    for (const widget of this._array) {
      const parent = widget.parent();
      if (parent && result.indexOf(parent) === -1) {
        result.push(parent);
      }
    }
    if (result.length) {
      return new WidgetCollection(result, {origin: this});
    }
  }

  children(selector) {
    const result = [];
    for (const widget of this._array) {
      result.push.apply(result, widget.children());
    }
    return new WidgetCollection(result, {selector, origin: this});
  }

  find(selector) {
    return new WidgetCollection(this.children()._array, {selector, deep: true, origin: this});
  }

  appendTo(parent) {
    parent.append(this);
  }

  set(...args) {
    this._array.forEach(widget => widget.set(...args));
    return this;
  }

  on(...args) {
    this._array.forEach(widget => widget.on(...args));
    return this;
  }

  off(...args) {
    this._array.forEach(widget => widget.off(...args));
    return this;
  }

  once(...args) {
    this._array.forEach(widget => widget.once(...args));
    return this;
  }

  trigger(...args) {
    this._array.forEach(widget => widget.trigger(...args));
    return this;
  }

  animate(...args) {
    this._array.forEach(widget => widget.animate(...args));
  }

  dispose() {
    this._array.forEach(widget => widget.dispose());
  }

  [Symbol.iterator]() {
    let index = 0;
    return {
      next: () => index < this.length
        ? {value: this[index++], done: false}
        : {done: true}
    };
  }

}

WidgetCollection.prototype[JSX.jsxFactory] = createElement;

/** @this {import("./JsxProcessor").default} */
function createElement(Type, attributes) {
  if (Object.keys(this.withoutChildren(attributes)).length) {
    throw new Error('JSX: WidgetCollection can not have attributes');
  }
  return new Type(this.getChildren(attributes) || []);
}

function getHost(origin) {
  if (origin instanceof WidgetCollection) {
    return origin.host;
  }
  return origin || null;
}
