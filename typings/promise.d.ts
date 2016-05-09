// Type definitions for promise v7.1.1
// Source: https://raw.githubusercontent.com/DefinitelyTyped/DefinitelyTyped/14fe4313f4a1cf69add3505a2ab1dbc690dc2116/promise/promise.d.ts
// Project: https://www.promisejs.org/
// Definitions by: Manuel Rueda <https://github.com/ManRueda>
// Modified for Tabris.js by: David Buschtöns <https://github.com/dbuschtoens>

interface IThenable<T> {
  catch<R>(onRejected?: (error: any) => IThenable<R> | R): IThenable<R>;
  done<R>(onFulfilled?: (value: T) => IThenable<R> | R, onRejected?: (error: any) => IThenable<R> | R): void;
  finally<R>(onResolved?: () => IThenable<R> | R): IThenable<R>;
  then<R>(onFulfilled?: (value: T) => IThenable<R> | R, onRejected?: (error: any) => IThenable<R> | R): IThenable<R>;
}

declare class Promise<T> implements IThenable<T> {

  /**
   * Returns a Promise that waits for all promises in the array to be fulfilled
   * and is then fulfilled with an array of those resulting values
   * (in the same order as the input).
   * @param array
   */
  static all(array: Array<IThenable<any>>): IThenable<Array<any>>;

  /**
   * Returns a promise that resolves or rejects as soon as any of the promises in
   * iterable have been resolved or rejected (with the corresponding reason or value).
   * @param array
   */
  static race(array: Array<IThenable<any>>): IThenable<any>;

  /**
   * Returns a promise that is rejected with the given *reason*.
   * @param reason
   */
  static reject<T>(reason: T): IThenable<T>;

  /**
   * Returns a promise that is resolved with the given *value*.
   * If the *value* is a promise, then it is unwrapped so that the
   * resulting promise adopts the state of the promise passed in as *value*.
   * @param value
   */
  static resolve<T>(value: T): IThenable<T>;

  /** 
   * If you call *resolve* in the body of the *resolver* passed to the constructor,
   * your promise is fulfilled with result object passed to resolve.
   * If you call *reject* your promise is rejected with the object passed to reject.
   * Any errors thrown in the constructor *resolver* will be implicitly passed to reject().
   * @param resolver
   */
  constructor(resolver: (resolve: (value: T) => void, reject: (reason: any) => void) => void);

  /**
   * Equivalent to calling "then(undefined, onRejected)"
   * @param onRejected called when/if promise rejects
   */
  catch<R>(onRejected?: (error: any) => IThenable<R> | R): IThenable<R>;

  /**
   * Calls *onFulfilled* or *onRejected* with the fulfillment value or rejection reason of the promise (as appropriate).
   * Unlike then it does not return a Promise.
   * It will also throw any errors that occur in the next tick, so they are not silenced.
   * @param onFulfilled called when/if promise resolves
   * @param onRejected called when/if promise rejects
   */
  done<R>(onFulfilled?: (value: T) => IThenable<R> | R, onRejected?: (error: any) => IThenable<R> | R): void;

  /**
   * Calls *onResolved* whenever the promise is resolved or rejected
   * @param onResolved called if promise resolves or rejects
   */
  finally<R>(onFinished?: () => IThenable<R> | R): IThenable<R>;

  /**
   * Calls *onFulfilled* or *onRejected* with the fulfillment value or rejection reason of the promise (as appropriate)
   * and returns a new promise resolving to the return value of the called handler.
   * If the handler throws an error, the returned Promise will be rejected with that error.
   * If the *onFulfilled* handler is not a function, it defaults to
   * the identify function (i.e. function (value) { return value; }).
   * If the *onRejected* handler is not a function, it defaults to a function
   * that always throws (i.e. function (reason) { throw reason; }).
   * @param onFulfilled called when/if promise resolves
   * @param onRejected called when/if promise rejects
   */
  then<R>(onFulfilled?: (value: T) => IThenable<R> | R, onRejected?: (error: any) => IThenable<R> | R): IThenable<R>;
}
