import Widget from './Widget';
import WidgetCollection from './WidgetCollection';
import {omit} from './util';

export const jsxFactory = Symbol('jsxFactory');

export function createElement(jsxType, attributes, ...children) {
  const fn = typeAsFunction(jsxType);
  if (fn.prototype && fn.prototype[jsxFactory]) {
    return fn.prototype[jsxFactory].call(null, fn, attributes, children);
  } else if (!fn.prototype) {
    return fn.call(null, attributes, children);
  }
  throw new Error(('JSX: Unsupported type ' + fn.name).trim());
}

Widget.prototype[jsxFactory] = (Type, attributes, children) => {
  let appendable = flattenChildren(children).filter(child => child instanceof Widget);
  let result = new Type(getPropertiesMap(attributes || {}, children), children);
  if (result instanceof WidgetCollection) {
    return result;
  } else if (result instanceof Widget) {
    result.on(getListenersMap(attributes || {}));
    return result.append instanceof Function ? result.append.apply(result, appendable) : result;
  }
  throw new Error(('JSX: Unsupported type ' + Type.name).trim());
};

WidgetCollection.prototype[jsxFactory] = (Type, attributes, children) => {
  let appendable = flattenChildren(children).filter(child => child instanceof Widget);
  if (attributes) {
    throw new Error('JSX: WidgetCollection can not have attributes');
  }
  return new WidgetCollection(appendable);
};

function typeAsFunction(jsxType) {
  if (jsxType instanceof Function) {
    return jsxType;
  }
  throw new Error(('JSX: Unsupported type ' + jsxType).trim());
}

function flattenChildren(children) {
  let result = [];
  for (let child of children) {
    if (child instanceof WidgetCollection) {
      result = result.concat(flattenChildren(child.toArray()));
    } else if (child instanceof Array) {
      result = result.concat(flattenChildren(child));
    } else {
      result.push(child);
    }
  }
  return result;
}

function getPropertiesMap(attributes, children) {
  let properties = omit(attributes, Object.keys(attributes).filter(isEventAttribute));
  let texts = children.filter(child => typeof child === 'string');
  if (texts.length) {
    properties.text = texts.join(' ');
  }
  return properties;
}

function getListenersMap(attributes) {
  let listeners = {};
  for (let attribute in attributes) {
    if (isEventAttribute(attribute)) {
      let event = attribute[2].toLocaleLowerCase() + attribute.slice(3);
      listeners[event] = attributes[attribute];
    }
  }
  return listeners;
}

function isEventAttribute(attribute) {
  return attribute.startsWith('on') && attribute.charCodeAt(2) <= 90;
}
