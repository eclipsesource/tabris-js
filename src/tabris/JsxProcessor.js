import {omit} from './util';
import Listeners from './Listeners';

const MARKUP = {
  br: {text: false, attributes: {}},
  b: {text: true, attributes: {}},
  span: {text: true, attributes: {}},
  big: {text: true, attributes: {}},
  i: {text: true, attributes: {}},
  small: {text: true, attributes: {}},
  strong: {text: true, attributes: {}},
  ins: {text: true, attributes: {}},
  del: {text: true, attributes: {}},
  a: {text: true, attributes: {href: 'string'}}
};

export const jsxFactory = Symbol('jsxFactory');

export function createJsxProcessor() {
  return new JsxProcessor(jsxFactory);
}

export default class JsxProcessor {

  constructor(jsxFactoryKey) {
    this.jsxFactory = jsxFactoryKey;
  }

  createElement(Type, attributes, ...children) {
    if (!(Type instanceof Function) && typeof Type !== 'string') {
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
    if (typeof Type === 'string') {
      return this.createIntrinsicElement(Type, attributes, finalChildren);
    }
    if (Type.prototype && Type.prototype[this.jsxFactory]) {
      return Type.prototype[this.jsxFactory].call(this, Type, attributes, finalChildren);
    } else if (!Type.prototype) {
      return Type.call(this, attributes, finalChildren);
    }
    throw new Error(`JSX: Unsupported type ${Type.name}`);
  }

  createIntrinsicElement(el, attributes, children) {
    if (el in MARKUP) {
      Object.keys(attributes || {}).forEach(attribute => {
        const attrType = typeof attributes[attribute];
        if (attrType !== MARKUP[el].attributes[attribute]) {
          throw new Error(`Element ${el} does not a support attribute ${attribute} of type ${attrType}`);
        }
      });
      if (children && children.length && !MARKUP[el].text) {
        throw new Error(`Element ${el} can not have children`);
      }
      const text = this.joinTextContent(children, true);
      const tagOpen = [el].concat(Object.keys(attributes || {}).map(
        attribute => `${attribute}='${attributes[attribute]}'`
      )).join(' ');
      if (text) {
        return `<${tagOpen}>${text}</${el}>`;
      }
      return `<${tagOpen}/>`;
    }
    throw new Error(`JSX: Unsupported type ${el}`);
  }

  createNativeObject(Type, attributes, children) {
    if (children && children.length) {
      throw new Error(`JSX: ${Type.name} can not have children`);
    }
    const result = new Type(this.getProperties(attributes || {}));
    this.registerListeners(result, attributes);
    return result;
  }

  normalizeChildren(children) {
    let result = [];
    for (const child of (children || [])) {
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

  withContentText(attributes, content, property, markupEnabled) {
    if (attributes && attributes[property] && content && content.length) {
      throw new Error(`JSX: ${property} given twice`);
    }
    const text = attributes && attributes[property]
      ? attributes[property].toString()
      : this.joinTextContent(content || [], markupEnabled);
    return Object.assign(attributes || {}, text ? {[property]: text} : {});
  }

  withContentChildren(attributes, content, property) {
    if (attributes && attributes[property] && content && content.length) {
      throw new Error(`JSX: ${property} given twice`);
    }
    const children = attributes && attributes[property] ? attributes[property] : (content || []);
    return Object.assign(attributes || {}, children ? {[property]: children} : {});
  }

  getProperties(attributes) {
    return omit(attributes, Object.keys(attributes).filter(this.isEventAttribute));
  }

  getListeners(attributes) {
    const listeners = {};
    for (const attribute in attributes) {
      if (this.isEventAttribute(attribute)) {
        const event = attribute[2].toLocaleLowerCase() + attribute.slice(3);
        listeners[event] = attributes[attribute];
      }
    }
    return listeners;
  }

  isEventAttribute(attribute) {
    return attribute.startsWith('on') && attribute.charCodeAt(2) <= 90;
  }

  joinTextContent(textArr, markupEnabled) {
    if (markupEnabled) {
      return textArr.map(str => str.trim()).join(' ').replace(/\s*<br\s*\/>\s*/g, '<br/>');
    }
    return textArr.join(' ');
  }

}

