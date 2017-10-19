import Widget from './Widget';
import WidgetCollection from './WidgetCollection';
import {omit} from './util';

export function createElement(jsxType, attributes, ...children) {
  let Type = typeToConstructor(jsxType);
  let appendable = flattenChildren(children).filter(child => child instanceof Widget);
  if (Type === WidgetCollection) {
    if (attributes) {
      throw new Error('JSX: WidgetCollection can not have attributes');
    }
    return new WidgetCollection(appendable);
  }
  let result = new Type(getPropertiesMap(attributes || {}, children));
  if (!(result instanceof Widget)) {
    throw new Error(('JSX: Unsupported type ' + Type.name).trim());
  }
  result.on(getListenersMap(attributes || {}));
  return result.append.apply(result, appendable);
}

function typeToConstructor(jsxType) {
  if (jsxType instanceof Function) {
    return jsxType;
  }
  let typeName = jsxType.charAt(0).toUpperCase() + jsxType.slice(1);
  let Type =  global.tabris[typeName];
  if (!(Type instanceof Function)) {
    throw new Error(('JSX: Unsupported type ' + jsxType).trim());
  }
  return Type;
}

function flattenChildren(children) {
  let result = [];
  for (let child of children) {
    if (child instanceof WidgetCollection) {
      result = result.concat(flattenChildren(child.toArray()));
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
