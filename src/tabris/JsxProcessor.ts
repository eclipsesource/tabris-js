import {omit} from './util';
import {getCurrentLine} from './util-stacktrace';
import {attributesWithoutListener, registerListenerAttributes} from './Listeners';
import {toValueString} from './Console';
import Color from './Color';
import Font from './Font';
import * as symbols from './symbols';
import checkType from './checkType';

type AttrConverters = {[attr: string]: (value: any) => any};

interface ElementFn {
  new(...args: any[]): any;
  (...args: any[]): any;
  [symbols.originalComponent]?: ElementFn;
  [symbols.jsxType]?: boolean;
}

const COMMON_ATTR: AttrConverters = Object.freeze({
  textColor: (value: any) => Color.from(value).toString(),
  font: (value: any) => Font.from(value).toString(),
  children: (value: any) => {
    if (!(value instanceof Array)) {
      throw new Error('Not an array: ' + toValueString(value));
    }
    return value;
  }
});

const MARKUP: {[el: string]: AttrConverters} = Object.freeze({
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
    href: (value: any) => {
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

  createElement(Type: ElementFn | string, attributes?: any, ...children: any[]) {
    if (!(Type instanceof Function) && typeof Type !== 'string') {
      throw new Error(`JSX: Unsupported type ${toValueString(Type)}`);
    }
    const typeName = Type instanceof Function ? Type.name : Type;
    if (attributes?.children && children && children.length) {
      throw new Error(`JSX: Children for type ${typeName} given twice.`);
    }
    // Children may be part of attributes or given as varargs or both.
    // For JSX factories/functional components they should always be part of attributes
    const rawChildren = children.length ? children : attributes?.children || [];
    const {finalChildren, additionalAttributes} = parseChildren(rawChildren, Type);
    const finalAttributes = {...attributes};
    joinAttributes(finalAttributes, additionalAttributes, Type);
    if (finalChildren) {
      finalAttributes.children = finalChildren;
    }
    if (typeof Type === 'string') {
      return this.createIntrinsicElement(Type, finalAttributes);
    } else if (Type.prototype && Type.prototype[JSX.jsxFactory]) {
      return this.createCustomComponent(Type, finalAttributes);
    } else {
      return this.createFunctionalComponent(Type, finalAttributes);
    }
  }

  createCustomComponent(Type: ElementFn, attributes: any) {
    return Type.prototype[JSX.jsxFactory].call(this, Type, attributes);
  }

  createFunctionalComponent(Type: ElementFn, attributes: any) {
    try {
      const result = Type.call(this, attributes);
      Type[symbols.jsxType] = true;
      if (result instanceof Object) {
        result[symbols.jsxType] = Type;
      }
      return result;
    } catch (ex) {
      throw new Error(`JSX: "${ex.message}" ${getCurrentLine(ex)}`);
    }
  }

  createIntrinsicElement(el: string, attributes: any) {
    if (el in MARKUP) {
      const encoded: any = {};
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

  createNativeObject(Type: any, attributes: any) {
    if (attributes && 'children' in attributes) {
      throw new Error(`JSX: ${Type.name} can not have children`);
    }
    const {data, ...properties} = attributesWithoutListener(attributes || {});
    const result = new Type(properties);
    registerListenerAttributes(result, attributes);
    if (data) {
      result.data = data;
    }
    return result;
  }

  getChildren(attributes: any) {
    if (!attributes || !('children' in attributes)) {
      return null;
    }
    return flattenChildren(attributes.children);
  }

  withoutChildren(attributes: any) {
    return omit(attributes, ['children']);
  }

  withContentText(attributes: any, content: any[], property: string, markupEnabled: boolean) {
    if (attributes && attributes[property] && content && content.length) {
      throw new Error(`JSX: ${property} given twice`);
    }
    const text = attributes && attributes[property]
      ? attributes[property].toString()
      : joinTextContent(content || [], markupEnabled);
    return Object.assign(attributes || {}, text ? {[property]: text} : {});
  }

  withContentChildren(attributes: any, content: any[], property: string) {
    if (attributes && attributes[property] && content && content.length) {
      throw new Error(`JSX: ${property} given twice`);
    }
    const children = attributes && attributes[property] ? attributes[property] : (content || []);
    return Object.assign(attributes || {}, children ? {[property]: children} : {});
  }

  withShorthands(
    attributes: object,
    shorthandsMapping: {[attr: string]: string},
    merge: ((value1: any, value2: string) => any)
  ): object {
    const shorthandsKeys = Object.keys(shorthandsMapping);
    const shorthands = shorthandsKeys.filter(value => value in attributes);
    if (!shorthands.length) {
      return attributes;
    }
    const attrCopy: any = omit(attributes, shorthandsKeys);
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

  makeFactories(dic: {[key: string]: ElementFn}) {
    const result: {[key: string]: ElementFn} = {};
    Object.keys(dic).forEach(key => {
      result[key] = this.makeFactory(dic[key]) as ElementFn;
    });
    return result;
  }

  makeFactory(constructor: ElementFn): ElementFn {
    if (arguments.length !== 1) {
      throw new Error(`Expected exactly one argument, got ${arguments.length}`);
    }
    checkType(constructor, Function, 'first parameter');
    if (!constructor.prototype || !constructor.prototype[JSX.jsxFactory]) {
      throw new Error(`Function ${constructor.name} is not a valid constructor`);
    }
    if (constructor[symbols.originalComponent])  {
      return this.makeFactory(constructor[symbols.originalComponent] as ElementFn);
    }
    return createFactoryProxy(this, constructor);
  }

}

function createFactoryProxy(processor: JsxProcessor, constructor: ElementFn): ElementFn {
  const handler: ProxyHandler<ElementFn> = {
    apply(target, _thisArg, args) {
      const [attributes, functionalComponent] = args;
      if (args.length > 1) {
        if (!(functionalComponent instanceof Function)) {
          throw new TypeError('Second parameter must be a function');
        }
        if (functionalComponent.prototype && functionalComponent.prototype[JSX.jsxFactory]) {
          throw new TypeError('Second parameter must be a factory');
        }
      }
      const result = processor.createElement(proxy, attributes);
      if (args.length > 1 && result instanceof Object) {
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
export function flattenChildren(children: unknown) {
  if (children instanceof Array) {
    let result: any[] = [];
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

export function joinTextContent(textArray: string[], markupEnabled: boolean) {
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

  processor: null as JsxProcessor | null,

  jsxFactory: symbols.jsxFactory,

  jsxType: symbols.jsxType,

  install(jsxProcessor: JsxProcessor) {
    this.processor = jsxProcessor;
  },

  createElement() {
    return this.processor!.createElement.apply(this.processor, arguments as any);
  }

};

function parseChildren(rawChildren: any[], type: ElementFn | string) {
  const children = rawChildren?.filter(value => !isAttributesObject(value));
  const attributes = rawChildren
    ?.filter(isAttributesObject)
    .reduce((prev, current) => joinAttributes(prev, current, type), {});
  return {
    finalChildren: children.length ? children : null,
    additionalAttributes: omit(attributes, [symbols.jsxType, symbols.setterTargetType])
  };
}

function isAttributesObject(value: any): value is {[symbols.setterTargetType]: Function} {
  return value instanceof Object && value[symbols.setterTargetType] instanceof Function;
}

function joinAttributes(target: any, source: any, actualTargetType: ElementFn | string): any {
  const expectedTargetType = source[symbols.setterTargetType];
  const actualTargetTypeFn = typeof actualTargetType === 'string' ? String : actualTargetType;
  if (expectedTargetType
    && actualTargetTypeFn.prototype[JSX.jsxFactory] // for SFC we can't know the future instance type
    && (actualTargetTypeFn.prototype !== expectedTargetType.prototype)
    && !(actualTargetTypeFn.prototype instanceof expectedTargetType)
  ) {
    const firstKey = Object.keys(source)[0];
    const typeName = actualTargetType instanceof Function
      ? actualTargetType.name
      : actualTargetType;
    throw new TypeError(
      `Attribute "${firstKey}" is targeting ${expectedTargetType.name}, but is set on ${typeName}`
    );
  }
  Object.keys(source).forEach(key => {
    if (key in target) {
      if (Array.isArray(target[key]) && Array.isArray(source[key])) {
        target[key] = target[key].concat(source[key]);
      } else {
        throw new Error(`Attribute "${key}" is set multiple times`);
      }
    } else {
      target[key] = source[key];
    }
  });
  return target;
}
