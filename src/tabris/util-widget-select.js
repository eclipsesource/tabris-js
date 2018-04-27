import NativeObject from './NativeObject';
import WidgetCollection from './WidgetCollection';

export function select(array, selector, deep) {
  if (!array || array.length === 0) {
    return [];
  }
  if (selector === '*' && !deep) {
    return array.concat();
  }
  let filter = getFilter(selector);
  if (deep) {
    return deepSelect([], array, filter);
  }
  return array.filter(filter);
}

function deepSelect(result, iterable, filter) {
  for (let widget of iterable) {
    if (filter(widget)) {
      result.push(widget);
    }
    let children = widget.children();
    if (children instanceof WidgetCollection && children.length) {
      deepSelect(result, children, filter);
    }
  }
  return result;
}

function getFilter(selector) {
  let matches = {};
  let filter = isFilter(selector) ? selector : createMatcher(selector);
  return (widget) => {
    if (matches[widget.cid]) {
      return false;
    }
    if (filter(widget)) {
      matches[widget.cid] = true;
      return true;
    }
    return false;
  };
}

function createMatcher(selector) {
  if (selector instanceof Function) {
    return widget => widget instanceof selector;
  }
  if (selector.charAt(0) === '#') {
    let expectedId = selector.slice(1);
    return widget => expectedId === widget.id;
  }
  if (selector.charAt(0) === '.') {
    let expectedClass = selector.slice(1);
    return widget => widget.classList.indexOf(expectedClass) !== -1;
  }
  if (selector === '*') {
    return () => true;
  }
  return widget => selector === widget.constructor.name;
}

function isFilter(selector) {
  return selector instanceof Function && !isWidgetConstructor(selector);
}

function isWidgetConstructor(fn) {
  let proto = fn.prototype;
  while (proto) {
    // Use NativeObject since importing Widget would causes circulary module dependency issues
    if (proto === NativeObject.prototype) {
      return true;
    }
    proto = Object.getPrototypeOf(proto);
  }
  return false;
}
