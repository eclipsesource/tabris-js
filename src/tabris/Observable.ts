import * as symbols from './symbols';
import {getValueTypeName} from './checkType';
import {
  SubscriptionHandler, PartialObserver, Subscription, NextCb, ErrorCb, CompleteCb, Subscriber, TeardownLogic
} from './Observable.types';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const noop = (...args: any[]) => undefined;

if (!Symbol.observable) {
  Object.defineProperty(Symbol, 'observable', {value: symbols.observable});
}
export default class Observable<T = unknown> {

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
