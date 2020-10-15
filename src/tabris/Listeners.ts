import Events from './Events';
import {toValueString} from './Console';
import {listenersStore as storeSym, observable as observableSym} from './symbols';
import {omit} from './util';
import Observable from './Observable';
import {Observer, TeardownLogic} from './Observable.types';
import EventObject from './EventObject';

const DELEGATE_FIELDS: Array<keyof Listeners | symbol> = [
  'promise', 'addListener', 'removeListener', 'once', 'trigger', 'triggerAsync',
  'subscribe', observableSym
];

type Store = typeof Events;

type Listener<T extends object> = (ev: EventObject & T) => any;

interface Attributes {
  [attribute: string]: any;
}

interface TargetCandidate {
  [storeSym]?: Store;
  on?: Function;
  jsxAttributes?: Attributes;
}

class Listeners<T extends object = object> extends Observable<T> {

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
    super(observer => this._handleSubscription(observer));
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

  public trigger(eventData?: T) {
    this.store.trigger(this.type, eventData);
    return this.target;
  }

  public async triggerAsync(eventData?: T) {
    return this.store.triggerAsync(this.type, eventData).then(() => this.target);
  }

  public async promise() {
    return new Promise(resolve => this.once(resolve));
  }

  public once(listener: Listener<T>) {
    this.store.once(this.type, listener);
    return this.target;
  }

  public addListener(listener: Listener<T>) {
    this.store.on(this.type, listener);
    return this.target;
  }

  public removeListener(listener: Listener<T>) {
    this.store.off(this.type, listener);
    return this.target;
  }

  private _handleSubscription(observer: Observer<T>): TeardownLogic {
    this.addListener(observer.next);
    this.store.on('dispose', observer.complete);
    return () => {
      this.removeListener(observer.next);
      this.store.off('dispose', observer.complete);
    };
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
