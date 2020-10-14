import Observable from './Observable';

export type TeardownLogic = Function | {unsubscribe: Function} | void;

export type SubscriptionHandler<T> = (
  this: Observable<T>,
  subscriber: Subscriber<T>
) => TeardownLogic;

export interface Observer<T> {
  next: NextCb<T>;
  error: ErrorCb;
  complete: CompleteCb;
}

export type NextCb<T> = ((value: T) => void);
export type ErrorCb = ((value: any) => void);
export type CompleteCb = (() => void);

export interface PartialObserver<T> {
  next?: (value: T) => any;
  error?: (ex: any) => any
  complete?: () => any
}

export interface Subscription {
  readonly closed: boolean;
  unsubscribe: () => void;
}

export interface Subscriber<T> extends Observer<T> {
  readonly closed: boolean;
}

declare global {
  interface SymbolConstructor {
    readonly observable: symbol;
  }
}
