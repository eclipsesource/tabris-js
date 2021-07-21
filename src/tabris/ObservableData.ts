import Listeners from './Listeners';
import Observable from './Observable';
import {Subscription} from './Observable.types';

export type Subscriptions = {[$propertySubscription: string]: Subscription | null};

const PUBLIC_PROP = /^[a-z]/;

type PropertyChange<T extends object> = {
  target: T,
  property: keyof T,
  subscriptions?: Subscriptions,
  init?: boolean
};

namespace internal {

  export class ObservableData {

    static generateChangeEvents<T extends object>(change: PropertyChange<T>) {
      const target = change.target;
      const value = change.target[change.property] as unknown;
      const subscriptionKey = `$${change.property}Subscription`;
      const subscriptions = change.subscriptions || target as Subscriptions;
      const eventName = change.property + 'Changed';
      let subscription: null | Subscription = null;
      subscriptions[subscriptionKey]?.unsubscribe();
      if (!change.init) {
        Listeners.trigger(target, eventName, {value});
      }
      if (value instanceof Object) {
        let $originalEvent: RawEvent | null = null;
        subscription = Observable.changeEvents(value, true).subscribe(ev => {
          if ($originalEvent?.type === ev.type && $originalEvent?.value === ev.value) {
            return;
          }
          $originalEvent = ev;
          Listeners.trigger(target, eventName, {value, $originalEvent});
          $originalEvent = null;
        });
      }
      Object.defineProperty(
        subscriptions,
        subscriptionKey,
        {enumerable: false, writable: true, value: subscription}
      );
    }

    constructor(properties?: Record<string, any>) {
      const subscriptions: {[$propertySubscription: string]: Subscription} = {};
      const proxy = new Proxy<any>(this, {
        set(target, property, value, receiver) {
          const willDefineProperty = !hasSetter(target, property);
          const success = Reflect.set(target, property, value, receiver);
          if (success && !willDefineProperty && isPublicProperty(property, value)) {
            ObservableData.generateChangeEvents({target: proxy, property, subscriptions});
          }
          return success;
        },
        defineProperty(target, property, ...args) {
          const success = Reflect.defineProperty(target, property, ...args);
          const value = target[property];
          if (success && isPublicProperty(property, value)) {
            ObservableData.generateChangeEvents({target: proxy, property, subscriptions});
          }
          return success;
        }
      });
      return Object.assign(proxy, properties);
    }

    [Symbol.observable]() {
      return Observable.changeEvents(this);
    }

  }

}

type ObservableData = internal.ObservableData;

type ObservableDataConstructor = typeof internal.ObservableData;
interface ObservableDataFactory extends ObservableDataConstructor {
  <T extends object>(properties?: T): ObservableData & T;
}

// eslint-disable-next-line @typescript-eslint/no-redeclare
const ObservableData = new Proxy(internal.ObservableData, {
  apply(_target, _thisArg, argArray) {
    return new internal.ObservableData(argArray[0] || {});
  }
}) as ObservableDataFactory;

ObservableData.prototype.constructor = ObservableData;

export default ObservableData;

function hasSetter(target: object, property: string | number | symbol): boolean {
  return property in Reflect.getPrototypeOf(target)
   || !!Reflect.getOwnPropertyDescriptor(target, property)?.set;
}

function isPublicProperty(property: string | number | symbol, value: unknown): property is string {
  return typeof property === 'string'
    && PUBLIC_PROP.test(property)
    && !(value instanceof Function && (value as any).original instanceof Listeners);
}

