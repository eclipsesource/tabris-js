import {omit} from './util';
import {getCurrentLine} from './util-stacktrace';
import Listeners from './Listeners';

const MARKUP = {
  br: {},
  b: {children: 'object'},
  span: {children: 'object'},
  big: {children: 'object'},
  i: {children: 'object'},
  small: {children: 'object'},
  strong: {children: 'object'},
  ins: {children: 'object'},
  del: {children: 'object'},
  a: {href: 'string', children: 'object'}
};

export const jsxFactory = Symbol('jsxFactory');
export const jsxType = Symbol('jsxType');

export function createJsxProcessor() {
  return new JsxProcessor(jsxFactory, jsxType);
}

export default class JsxProcessor {

  constructor(jsxFactoryKey, jsxTypeKey) {
    this.jsxFactory = jsxFactoryKey;
    this.jsxType = jsxTypeKey;
  }

  createElement(Type, attributes, ...children) {
    if (!(Type instanceof Function) && typeof Type !== 'string') {
      throw new Error(`JSX: Unsupported type ${Type}`);
    }
    if (attributes && attributes.children && children && children.length) {
      throw new Error(`JSX: Children for type ${Type} given twice.`);
    }
    // Children may be part of attributes or given as varargs or both.
    // For JSX factories/functional components they should always be part of attributes
    const finalChildren = (children && children.length ? children : null)
      || ((attributes && attributes.children && attributes.children.length) ? attributes.children : null);
    const finalAttributes = Object.assign({}, attributes || {});
    if (finalChildren && finalChildren.length) {
      finalAttributes.children = finalChildren;
    } else {
      delete finalAttributes.children;
    }
    if (typeof Type === 'string') {
      return this.createIntrinsicElement(Type, finalAttributes);
    }
    if (Type.prototype && Type.prototype[this.jsxFactory]) {
      return Type.prototype[this.jsxFactory].call(this, Type, finalAttributes);
    }
    try {
      const result = Type.call(this, finalAttributes);
      Type[jsxType] = true;
      if (result instanceof Object) {
        result[jsxType] = Type;
      }
      return result;
    } catch (ex) {
      throw new Error(`JSX: "${ex.message}" ${getCurrentLine(ex)}`);
    }
  }

  createIntrinsicElement(el, attributes) {
    if (el in MARKUP) {
      Object.keys(attributes || {}).forEach(attribute => {
        const attrType = typeof attributes[attribute];
        if (attrType !== MARKUP[el][attribute]) {
          if (attribute === 'children') {
            throw new Error(`Element ${el} can not have children`);
          } else {
            throw new Error(`Element ${el} does not a support attribute ${attribute} of type ${attrType}`);
          }
        }
      });
      const text = joinTextContent(attributes.children, true);
      const tagOpen = [el].concat(Object.keys(attributes || {}).filter(attr => attr !== 'children').map(
        attribute => `${attribute}='${attributes[attribute]}'`
      )).join(' ');
      if (text) {
        return `<${tagOpen}>${text}</${el}>`;
      }
      return `<${tagOpen}/>`;
    }
    throw new Error(`JSX: Unsupported type ${el}`);
  }

  createNativeObject(Type, attributes) {
    if (attributes && 'children' in attributes) {
      throw new Error(`JSX: ${Type.name} can not have children`);
    }
    const result = new Type(this.withoutListeners(attributes || {}));
    this.registerListeners(result, attributes);
    return result;
  }

  getChildren(attributes) {
    if (!attributes || !('children' in attributes)) {
      return null;
    }
    return normalizeChildren(attributes.children);
  }

  withoutChildren(attributes) {
    return omit(attributes, ['children']);
  }

  withoutListeners(attributes) {
    return omit(attributes, Object.keys(attributes).filter(this.isEventAttribute));
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
      : joinTextContent(content || [], markupEnabled);
    return Object.assign(attributes || {}, text ? {[property]: text} : {});
  }

  withContentChildren(attributes, content, property) {
    if (attributes && attributes[property] && content && content.length) {
      throw new Error(`JSX: ${property} given twice`);
    }
    const children = attributes && attributes[property] ? attributes[property] : (content || []);
    return Object.assign(attributes || {}, children ? {[property]: children} : {});
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

}

/**
 * Converts any value to a flat array.
 */
export function normalizeChildren(children) {
  if (children instanceof Array) {
    let result = [];
    for (const child of children) {
      if (child && child.toArray) {
        result = result.concat(normalizeChildren(child.toArray()));
      } else if (child instanceof Array) {
        result = result.concat(normalizeChildren(child));
      } else {
        result.push(child);
      }
    }
    return result;
  }
  return [children];
}

/**
 * @param {string[]} textArray
 * @param {boolean} markupEnabled
 */
export function joinTextContent(textArray, markupEnabled) {
  if (!textArray) {
    return null;
  }
  if (markupEnabled) {
    return textArray.map(str => (str + '').trim()).join(' ').replace(/\s*<br\s*\/>\s*/g, '<br/>');
  }
  return textArray.join(' ');
}
