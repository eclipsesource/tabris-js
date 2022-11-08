import {getValueTypeName} from './checkType';
import EventObject from './EventObject';
import Listeners from './Listeners';
import NativeObject from './NativeObject';
import {
  CompleteCb, ErrorCb, NextCb, PartialObserver, Subscriber, Subscription, SubscriptionHandler, TeardownLogic
} from './Observable.types';
import * as symbols from './symbols';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const noop = (...args: any[]) => undefined;

if (!Symbol.observable) {
  Object.defineProperty(Symbol, 'observable', {value: symbols.observable});
}

export default class Observable<T = unknown> {

  private static deferred: Function[] = [];
  private static inFlush = false;

  public static mutations<T extends object>(object: T): Observable<T> {
    return new Observable(observer => {
      const next = () => observer.next(object);
      next();
      return this.changeEvents(object, true).subscribe({
        next: () => this.defer(next),
        complete: observer.complete,
        error: observer.error
      });
    });
  }

  public static changeEvents<T extends object>(object: T, raw: true): Observable<RawEvent>;
  public static changeEvents<T extends object>(object: T, raw?: false): Observable<PropertyChangedEvent<T, any>>;
  public static changeEvents<T extends object>(object: T, raw?: boolean): Observable<any> {
    return new Observable(observer => {
      const store = Listeners.getListenerStore(object);
      const native = (object as NativeObject)[symbols.nativeObservables];
      const dummyListener = () => null;
      const handleAny = (ev: RawEvent) => {
        if (!ev.type.endsWith('Changed')) {
          return;
        }
        if (raw === true) {
          observer.next(ev);
        } else {
          observer.next(ev.dispatchObject ?? EventObject.create(ev.target, ev.type, ev));
        }
      };
      store.on({'*': handleAny, 'dispose': observer.complete});
      native?.forEach(event => store.on(event, dummyListener));
      return () => {
        store.off({'*': handleAny, 'dispose': observer.complete});
        native?.forEach(event => store.off(event, dummyListener));
      };
    });
  }

  /**
   * Public only to achieve type compatibility with RxJS
   * @private
   */
  public _subscribe: SubscriptionHandler<T>;

  constructor(subscribe: SubscriptionHandler<T> = noop) {
    if (!(subscribe instanceof Function)) {
      throw new TypeError(
        `Expected subscribe to be a function, got ${getValueTypeName(subscribe)}.`
      );
    }
    this._subscribe = subscribe;
    this.subscribe = this.subscribe.bind(this);
  }

  public subscribe(observer: PartialObserver<T>): Subscription;
  public subscribe(next?: NextCb<T>, error?: ErrorCb, complete?: CompleteCb): Subscription
  public subscribe(arg1: unknown, error?: ErrorCb, complete?: CompleteCb): Subscription {
    const observer: PartialObserver<T> = typeof arg1 === 'function' || arguments.length !== 1
      ? {next: arg1 as NextCb<T>, error, complete}
      : arg1 as PartialObserver<T>;
    let closed = false;
    let unsubscribe: Function = noop;
    const subscription = {
      unsubscribe: () => {
        unsubscribe();
        closed = true;
      },
      get closed() {
        return closed;
      }
    };
    const teardown = this._subscribe(createSubscriber(observer, subscription));
    unsubscribe = getUnsubscribe(teardown);
    if (subscription.closed) {
      unsubscribe();
    }
    return subscription;
  }

  public [Symbol.observable]?() {
    return this;
  }

  private static defer(fn: Function) {
    if (this.deferred.indexOf(fn) === -1) {
      this.deferred.push(fn);
    }
    if (!this.inFlush) {
      tabris.once('tick', this.flush);
    }
  }

  private static flush() {
    let limit = Observable.deferred.length + 100;
    while (Observable.deferred.length) {
      try {
        limit--;
        if (limit === 0) {
          Observable.deferred = [];
          throw new Error('Mutations observer recursion');
        }
        Observable.deferred.shift()!();
      } catch (ex) {
        console.error((ex as Error)?.message);
      }
    }
  }

}

function createSubscriber<T>(
  observer: PartialObserver<T>,
  subscription: Subscription
): Subscriber<T> {
  const next = observer.next || noop;
  const error = observer.error || noop;
  const complete = observer.complete || noop;
  return {
    next: (value: T) => {
      if (!subscription.closed) {
        next?.call(observer, value);
      }
    },
    error: (ex: any) => {
      if (!subscription.closed) {
        subscription.unsubscribe();
        error?.call(observer, ex);
      }
    },
    complete: () => {
      if (!subscription.closed) {
        subscription.unsubscribe();
        complete?.call(observer);
      }
    },
    get closed() {
      return subscription.closed;
    }
  };
}

function getUnsubscribe(teardown: TeardownLogic) {
  let called = false;
  return () => {
    if (!called) {
      called = true;
      if (teardown instanceof Function) {
        teardown();
      } else if (teardown && teardown.unsubscribe instanceof Function) {
        teardown.unsubscribe();
      }
    }
  };
}
