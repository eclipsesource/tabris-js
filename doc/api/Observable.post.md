## Related Types

### SubscriptionHandler<T>

* JavaScript Type: `Function`
* TypeScript Type: `tabris.ImageLikeObject`

```ts
type SubscriptionHandler<T> = (subscriber: Subscriber<T>) => TeardownLogic;
```

This function is passed to a [`Observable` constructor](#constructor) to control the behavior of the observable. It is executed every time the [`subscribe`](#subscribeobserver) method is called. It is given a [`Subscriber`](#subscribert) object to send "next", "error" and "complete" messages to the respective callbacks. It may also return a [teardown function](#teardownloagic).

Example:

```js
new Observable(subscriber => {
  subscriber.next('foo');
  return {
    unsubscribe: () => doSomething()
  }
});
```

### TeardownLogic

* JavaScript Type: `Function`, `Object`
* TypeScript Type: `tabris.TeardownLogic`

```ts
type TeardownLogic = Function | {unsubscribe: Function} | void;
```

A function or object with an `unsubscribe` method. It is called once the subscription [is closed](#subscription). This can be used to free up resources that were allocated by the [subscription handler](#subscriptionhandlert). For example, it may cancel a timer or de-register a listener.

### Subscriber<T>

* JavaScript Type: `Object`
* TypeScript Type: `tabris.Subscriber`

```ts
interface Subscriber<T> {
  closed: boolean;
  next: (value: T) => void;
  error: (value: any) => void;
  complete: () => void;
}
```

When calling the methods of this object the respective `next`, `error` and `complete` callbacks given to [`subscribe()`](#subscribeobserver) will be invoked. This may happen synchronously (while the [subscription handler](#subscriptionhandlert) executes) or later (i.e. asynchronously), for example in a timer.

### PartialObserver<T>

* JavaScript Type: `Object`
* TypeScript Type: `tabris.PartialObserver`

```ts
interface PartialObserver<T> {
  next?: (value: T) => any;
  error?: (ex: any) => void
  complete?: () => any
}
```

A plain object to be passed to the [`subscribe()`](#subscribeobserver) method. It may implement some or all of the methods `next()`, `error()` and `complete()`. Alternatively, the [`subscribe()`](#subscribeobserver) method may be passed some or all of these callbacks directly.

### Subscription

* JavaScript Type: `Object`
* TypeScript Type: `tabris.Subscription`

```ts
interface Subscription {
  readonly closed: boolean;
  unsubscribe: () => void;
}
```

This object is returned by the [`subscribe()`](#subscribeobserver) method. Calling its `unsubscribe()` method ends the subscription. The callbacks will not by invoked any more and any resources associated with the subscription will be freed up.
