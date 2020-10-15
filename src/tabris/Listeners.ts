import Events from './Events';
import {toValueString} from './Console';
import {listenersStore as storeSym} from './symbols';
import {omit} from './util';

const DELEGATE_FIELDS: Array<keyof Listeners> = [
  'promise', 'addListener', 'removeListener', 'once', 'trigger', 'triggerAsync'
];

type Store = typeof Events;

interface Attributes {
  [attribute: string]: any;
}

interface TargetCandidate {
  [storeSym]?: Store;
  on?: Function;
  jsxAttributes?: Attributes;
}

class Listeners {

  public static getListenerStore(target: TargetCandidate): Store {
    if (target.on instanceof Function) {
      return target as unknown as Store;
    }
    if (!target[storeSym]) {
      target[storeSym] = Object.assign({$eventTarget: target}, Events);
    }
    return target[storeSym] as Store;
  }

  private readonly store: Store;

  constructor(public readonly target: object, public readonly type: string) {
    if (arguments.length < 1) {
      throw new Error('Missing target instance');
    }
    if (!(target instanceof Object)) {
      throw new Error(`Target ${toValueString(target)} is not an object`);
    }
    if (arguments.length < 2 || !type) {
      throw new Error('Missing event type string');
    }
    if (typeof type !== 'string') {
      throw new Error(`Event type ${toValueString(type)} is not a string`);
    }
    if (/^on[A-Z]/.test(type)) {
      throw new Error(`Invalid event type string, did you mean "${type[2].toLowerCase() + type.slice(3)}"?`);
    }
    this.store = Listeners.getListenerStore(target);
    const original = this as any;
    const delegate: any = Object.assign(
      this.addListener.bind(this),
      {original, target, type}
    );
    for (const key of DELEGATE_FIELDS) {
      delegate[key] = original[key] = original[key].bind(this);
    }
    return delegate;
  }

  public get original() {
    return this;
  }

  public trigger(eventData?: object) {
    this.store.trigger(this.type, eventData);
    return this.target;
  }

  public async triggerAsync(eventData?: object) {
    return this.store.triggerAsync(this.type, eventData).then(() => this.target);
  }

  public async promise() {
    return new Promise(resolve => this.once(resolve));
  }

  public once(listener: Function) {
    this.store.once(this.type, listener);
    return this.target;
  }

  public addListener(listener: Function) {
    this.store.on(this.type, listener);
    return this.target;
  }

  public removeListener(listener: Function) {
    this.store.off(this.type, listener);
    return this.target;
  }

}

interface Listeners {
  // eslint-disable-next-line @typescript-eslint/prefer-function-type
  (listener: Function): this;
}

export default Listeners;

export class ChangeListeners extends Listeners {

  constructor(target: object, property: string) {
    propertyCheck(target, property);
    super(target, property + 'Changed');
  }

  public trigger(eventData?: object) {
    if (!eventData || !('value' in eventData)) {
      throw new Error('Can not trigger change event without "value" property in event data');
    }
    return super.trigger(eventData);
  }

}

export function attributesWithoutListener(attributes: object) {
  return omit(attributes, Object.keys(attributes).filter(isListenerAttribute));
}

export function registerListenerAttributes(
  obj: TargetCandidate,
  attributes: Attributes,
  attached: object
) {
  if (!obj.jsxAttributes) {
    obj.jsxAttributes = {};
  }
  const attachedListeners: Attributes = attached || obj.jsxAttributes;
  const newListeners = getEventListeners(attributes);
  const store = Listeners.getListenerStore(obj);
  Object.keys(newListeners).forEach(type => {
    const oldListener = attachedListeners[type];
    if (oldListener) {
      if (newListeners[type] === oldListener) {
        return;
      }
      store.off(type, oldListener);
    }
    if (newListeners[type]) {
      store.on(type, attachedListeners[type] = newListeners[type]);
    }
  });
}

export function isListenerAttribute(attribute: string) {
  return attribute.startsWith('on') && attribute.charCodeAt(2) <= 90;
}

function getEventListeners(attributes: Attributes) {
  const listeners: {[event: string]: Function} = {};
  for (const attribute in attributes) {
    if (isListenerAttribute(attribute)) {
      const event = attribute[2].toLocaleLowerCase() + attribute.slice(3);
      listeners[event] = attributes[attribute];
    }
  }
  return listeners;
}

function propertyCheck(target: TargetCandidate, property: string) {
  if (!(property in target)) {
    throw new Error(`Target has no property "${property}"`);
  }
}
