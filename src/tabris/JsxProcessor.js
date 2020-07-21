import {omit} from './util';
import {getCurrentLine} from './util-stacktrace';
import {attributesWithoutListener, registerListenerAttributes} from './Listeners';
import {toValueString} from './Console';
import Color from './Color';
import Font from './Font';
import * as symbols from './symbols';
import checkType from './checkType';

const COMMON_ATTR = Object.freeze({
  textColor: value => Color.from(value).toString(),
  font: value => Font.from(value).toString(),
  children: value => {
    if (!(value instanceof Array)) {
      throw new Error('Not an array: ' + toValueString(value));
    }
    return value;
  }
});

const MARKUP = Object.freeze({
  br: {},
  b: COMMON_ATTR,
  span: COMMON_ATTR,
  big: COMMON_ATTR,
  i: COMMON_ATTR,
  small: COMMON_ATTR,
  strong: COMMON_ATTR,
  ins: COMMON_ATTR,
  del: COMMON_ATTR,
  a: Object.assign({
    href: value => {
      if (typeof value !== 'string') {
        throw new Error('Not a string: ' + toValueString(value));
      }
      return value;
    }
  }, COMMON_ATTR)
});

export function createJsxProcessor() {
  return new JsxProcessor();
}

export default class JsxProcessor {

  createElement(Type, attributes, ...children) {
    if (!(Type instanceof Function) && typeof Type !== 'string') {
      throw new Error(`JSX: Unsupported type ${toValueString(Type)}`);
    }
    if (attributes && attributes.children && children && children.length) {
      throw new Error(`JSX: Children for type ${Type.name} given twice.`);
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
    } else if (Type.prototype && Type.prototype[JSX.jsxFactory]) {
      return this.createCustomComponent(Type, finalAttributes);
    } else {
      return this.createFunctionalComponent(Type, finalAttributes);
    }
  }

  createCustomComponent(Type, attributes) {
    return Type.prototype[JSX.jsxFactory].call(this, Type, attributes);
  }

  createFunctionalComponent(Type, attributes) {
    try {
      const result = Type.call(this, attributes);
      Type[JSX.jsxType] = true;
      if (result instanceof Object) {
        result[JSX.jsxType] = Type;
      }
      return result;
    } catch (ex) {
      throw new Error(`JSX: "${ex.message}" ${getCurrentLine(ex)}`);
    }
  }

  createIntrinsicElement(el, attributes) {
    if (el in MARKUP) {
      const encoded = {};
      Object.keys(attributes || {}).forEach(attribute => {
        const encoder = MARKUP[el][attribute];
        if (!encoder) {
          if (attribute === 'children') {
            throw new Error(`Element "${el}" can not have children`);
          } else {
            throw new Error(`Element "${el}" does not support attribute "${attribute}"`);
          }
        }
        try {
          encoded[attribute] = encoder(attributes[attribute]);
        } catch(ex) {
          throw new Error(`Element "${el}" attribute "${attribute}" can not bet set: ${ex.message}`);
        }
      });
      const text = joinTextContent(encoded.children, true);
      const tagOpen = [el].concat(Object.keys(encoded || {}).filter(attr => attr !== 'children').map(
        attribute => `${attribute}='${encoded[attribute]}'`
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
    const result = new Type(attributesWithoutListener(attributes || {}));
    registerListenerAttributes(result, attributes);
    return result;
  }

  getChildren(attributes) {
    if (!attributes || !('children' in attributes)) {
      return null;
    }
    return flattenChildren(attributes.children);
  }

  withoutChildren(attributes) {
    return omit(attributes, ['children']);
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

  /**
   * @param {object} attributes
   * @param {{[attr: string]: string}} shorthandsMapping
   * @param {((value1: any, value2: string) => any)} merge
   * @returns {object}
   */
  withShorthands(attributes, shorthandsMapping, merge) {
    const shorthandsKeys = Object.keys(shorthandsMapping);
    const shorthands = shorthandsKeys.filter(value => value in attributes);
    if (!shorthands.length) {
      return attributes;
    }
    const attrCopy = omit(attributes, shorthandsKeys);
    shorthands.forEach(shorthand => {
      const prop = shorthandsMapping[shorthand];
      if (prop in attrCopy) {
        attrCopy[prop] = merge(attrCopy[prop], shorthand);
      } else {
        attrCopy[prop] = shorthand;
      }
    });
    return attrCopy;
  }

  /**
   * @template {new(...args: any[]) => any} Constructor
   * @template {Constructor & ((...any) => any)} Factory
   * @template {object} Constructors
   * @param {Constructors} dic
   * @returns {Partial<{[key in keyof Constructors]: Factory}>}
   */
  makeFactories(dic) {
    const result = {};
    Object.keys(dic).forEach(key => {
      result[key] = this.makeFactory(dic[key]);
    });
    return result;
  }

  /**
   * @template {object} Instance
   * @template {new(...args: any[]) => Instance} Constructor
   * @template {Constructor & ((...any) => Instance)} Factory
   * @param {Constructor} constructor
   * @returns {Factory}
   */
  makeFactory(constructor) {
    if (arguments.length !== 1) {
      throw new Error(`Expected exactly one argument, got ${arguments.length}`);
    }
    checkType(constructor, Function, 'first parameter');
    if (!constructor.prototype || !constructor.prototype[JSX.jsxFactory]) {
      throw new Error(`Function ${constructor.name} is not a valid constructor`);
    }
    if (constructor[symbols.originalComponent])  {
      return this.makeFactory(constructor[symbols.originalComponent]);
    }
    return createFactoryProxy(this, constructor);
  }

}

/**
   * @template {object} Instance
   * @template {new(...args: any[]) => Instance} Constructor
   * @template {Constructor & ((...any) => Instance)} Factory
   * @param {JsxProcessor} processor
   * @param {Constructor} constructor
   * @returns {Factory}
   */
function createFactoryProxy(processor, constructor) {
  /** @type {ProxyHandler} */
  const handler = {
    apply(target, _thisArg, args) {
      const [attributes, functionalComponent] = args;
      const result = processor.createElement(proxy, attributes);
      if (functionalComponent instanceof Function && result instanceof Object) {
        functionalComponent[JSX.jsxType] = true;
        result[JSX.jsxType] = functionalComponent;
      }
      return result;
    },
    get(target, property, receiver) {
      if (receiver === proxy) {
        if (property === symbols.originalComponent) {
          return constructor;
        }
        if (property === symbols.proxyHandler) {
          return handler;
        }
      }
      return Reflect.get(target, property, receiver);
    }
  };
  /** @type {Factory} */
  const proxy = new Proxy(constructor, handler);
  return proxy;
}

/**
 * Converts any value to a flat array.
 */
export function flattenChildren(children) {
  if (children instanceof Array) {
    let result = [];
    for (const child of children) {
      if (child && child.toArray) {
        result = result.concat(flattenChildren(child.toArray()));
      } else if (child instanceof Array) {
        result = result.concat(flattenChildren(child));
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
    return textArray
      .map(str => str + '')
      .join('')
      .replace(/\s+/g, ' ')
      .replace(/\s*<br\s*\/>\s*/g, '<br/>');
  }
  return textArray.join('');
}

export const JSX = {

  /** @type {unique Symbol} */
  jsxFactory: Symbol('jsxFactory'),

  /** @type {unique Symbol} */
  jsxType: Symbol('jsxType'),

  /** @param {JsxProcessor} jsxProcessor */
  install(jsxProcessor) {
    this.processor = jsxProcessor;
  },

  createElement() {
    return this.processor.createElement.apply(this.processor, arguments);
  }

};
