import {select} from './util-widget-select';
import {jsxFactory} from './JsxProcessor';

export default class WidgetCollection {

  constructor(collection, {selector, deep, origin} = {}) {
    if (selector && !origin) {
      throw new Error('WidgetCollection can not be constructed with an selector but no origin');
    }
    const arr = collection instanceof WidgetCollection ? collection.toArray() : collection;
    Object.defineProperty(this, 'host', {value: getHost(origin)});
    this._array = select(arr, selector || '*', deep, origin instanceof WidgetCollection ? origin : this);
    for (let i = 0; i < this._array.length; i++) {
      this[i] = this._array[i];
    }
  }

  get length() {
    return this._array.length;
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

  set() {
    this._array.forEach(widget => widget.set.apply(widget, arguments));
    return this;
  }

  on() {
    this._array.forEach(widget => widget.on.apply(widget, arguments));
    return this;
  }

  off() {
    this._array.forEach(widget => widget.off.apply(widget, arguments));
    return this;
  }

  once() {
    this._array.forEach(widget => widget.once.apply(widget, arguments));
    return this;
  }

  trigger() {
    this._array.forEach(widget => widget.trigger.apply(widget, arguments));
    return this;
  }

  animate() {
    this._array.forEach(widget => widget.animate.apply(widget, arguments));
  }

  dispose() {
    this._array.forEach(widget => widget.dispose.apply(widget, arguments));
  }

  [Symbol.iterator]() {
    let index = 0;
    return {
      next: () => index < this.length
        ? {value: this[index++], done: false}
        : {done: true}
    };
  }

  /** @this {import("./JsxProcessor").default} */
  [jsxFactory](Type, attributes) {
    if (Object.keys(this.withoutChildren(attributes)).length) {
      throw new Error('JSX: WidgetCollection can not have attributes');
    }
    return new Type(this.getChildren(attributes) || []);
  }

}
function getHost(origin) {
  if (origin instanceof WidgetCollection) {
    return origin.host;
  }
  return origin || null;
}
