import NativeObject from './NativeObject';
import WidgetCollection from './WidgetCollection';

export function select(array, selector, deep, widgetCollection) {
  if (!array || array.length === 0) {
    return [];
  }
  if (selector === '*' && !deep) {
    return array.concat();
  }
  const filter = getFilter(selector, widgetCollection);
  if (deep) {
    return deepSelect([], array, filter);
  }
  return array.filter(filter);
}

export function createSelectorArray(selector, host) {
  if (!selector) {
    return ['*'];
  }
  if (selector instanceof Function) {
    return [selector];
  }
  const result = selector.split('>').map(str => str.trim());
  const rootIndex = result.indexOf(':host');
  if (rootIndex !== -1) {
    result[rootIndex] = host || tabris.ui;
  }
  return result;
}

export function getSelectorSpecificity(selectorArray) {
  return selectorArray.filter(isIdSelector).length * 100
    + selectorArray.filter(isClassSelector).length * 10
    + selectorArray.filter(isTypeSelector).length;
}

function isTypeSelector(selector) {
  return selector !== '*' && !isIdSelector(selector) && !isClassSelector(selector);
}

function isClassSelector(selector) {
  return selector[0] === '.' || selector[0] === ':';
}

function isIdSelector(selector) {
  return selector[0] === '#';
}

function deepSelect(result, iterable, filter) {
  for (const widget of iterable) {
    if (filter(widget)) {
      result.push(widget);
    }
    const children = widget.children ? widget.children() : null;
    if (children instanceof WidgetCollection && children.length) {
      deepSelect(result, children, filter);
    }
  }
  return result;
}

function getFilter(selector, widgetCollection) {
  const matches = {};
  const filter = isFilter(selector) ? selector : createMatcher(selector, widgetCollection);
  return (widget, index) => {
    if (matches[widget.cid]) {
      return false;
    }
    if (filter(widget, index, widgetCollection)) {
      matches[widget.cid] = true;
      return true;
    }
    return false;
  };
}

function createMatcher(selectorArg, widgetCollection) {
  let selector = selectorArg;
  if (selector instanceof Array) {
    if (selector.length === 1) {
      selector = selector[0];
    } else {
      return createChildMatcher(selector, widgetCollection);
    }
  }
  if (selector instanceof Function) {
    return widget => widget instanceof selector;
  }
  if (selector instanceof NativeObject) {
    return widget => widget === selector;
  }
  if (selector.indexOf('>') !== -1) {
    return createChildMatcher(createSelectorArray(selector, widgetCollection.host), widgetCollection);
  }
  if (selector.charAt(0) === '#') {
    const expectedId = selector.slice(1);
    return widget => expectedId === widget.id;
  }
  if (selector.charAt(0) === '.') {
    const expectedClass = selector.slice(1);
    return widget => widget.classList.indexOf(expectedClass) !== -1;
  }
  if (selector === '*') {
    return () => true;
  }
  return widget => selector === widget.constructor.name;
}

function createChildMatcher(selectors, widgetCollection) {
  const matchers = selectors
    .map(selector => createMatcher(selector, widgetCollection)).reverse();
  return widget => {
    let current = widget;
    for (let i = 0; i < matchers.length; i++) {
      if (!current || !matchers[i](current)) {
        return false;
      }
      current = current.parent();
    }
    return true;
  };
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
