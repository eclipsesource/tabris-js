import {omit} from './util';
import Listeners from './Listeners';

export const jsxFactory = Symbol('jsxFactory');

export function createJsxProcessor() {
  return new JsxProcessor(jsxFactory);
}

export default class JsxProcessor {

  constructor(jsxFactoryKey) {
    this.jsxFactory = jsxFactoryKey;
  }

  createElement(Type, attributes, ...children) {
    if (!(Type instanceof Function)) {
      throw new Error(`JSX: Unsupported type ${Type}`);
    }
    if (attributes && attributes.children && children && children.length) {
      throw new Error(`JSX: Children for type ${Type} given twice.`);
    }
    const finalChildren = (children && children.length ? children : null)
      || ((attributes && attributes.children && attributes.children.length) ? attributes.children : []);
    if (attributes && attributes.children) {
      delete attributes.children;
    }
    if (Type.prototype && Type.prototype[this.jsxFactory]) {
      return Type.prototype[this.jsxFactory].call(this, Type, attributes, finalChildren);
    } else if (!Type.prototype) {
      return Type.call(this, attributes, finalChildren);
    }
    throw new Error(`JSX: Unsupported type ${Type.name}`);
  }

  createNativeObject(Type, attributes, children) {
    if (children && children.length) {
      throw new Error(`JSX: ${Type.name} can not have children`);
    }
    let result = new Type(this.getProperties(attributes || {}, children), children);
    this.registerListeners(result, attributes);
    return result;
  }

  normalizeChildren(children) {
    let result = [];
    for (let child of (children || [])) {
      if (child.toArray) {
        result = result.concat(this.normalizeChildren(child.toArray()));
      } else if (child instanceof Array) {
        result = result.concat(this.normalizeChildren(child));
      } else {
        result.push(child);
      }
    }
    return result;
  }

  registerListeners(obj, attributes) {
    Listeners.getListenerStore(obj).on(this.getListeners(attributes));
  }

  withTextContent(attributes, children, property) {
    if (attributes && attributes[property] && children && children.length) {
      throw new Error(`JSX: ${property} given twice`);
    }
    const text = attributes && attributes[property] ? attributes[property].toString() : (children || []).join(' ');
    return Object.assign(attributes || {}, text ? {[property]: text} : {});
  }

  getProperties(attributes) {
    return omit(attributes, Object.keys(attributes).filter(this.isEventAttribute));
  }

  getListeners(attributes) {
    let listeners = {};
    for (let attribute in attributes) {
      if (this.isEventAttribute(attribute)) {
        let event = attribute[2].toLocaleLowerCase() + attribute.slice(3);
        listeners[event] = attributes[attribute];
      }
    }
    return listeners;
  }

  isEventAttribute(attribute) {
    return attribute.startsWith('on') && attribute.charCodeAt(2) <= 90;
  }

}

