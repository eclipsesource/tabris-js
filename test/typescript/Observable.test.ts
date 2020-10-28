import {TeardownLogic, Subscription, SubscriptionHandler, Observable, PartialObserver, Subscriber} from 'tabris';

let observable: Observable<string>;
let observer: Subscriber<string>;
let partialObserver: PartialObserver<string> = {};
let subHandler: SubscriptionHandler<string>;
let subscription: Subscription;
let teardownObject: TeardownLogic = () => undefined;
let str: string = '';
let err: Error;

teardownObject = {unsubscribe: () => undefined}

observable = new Observable(() => {});
observable = new Observable<string>(() => {});
observable = new Observable(observerArg => {
  observer = observerArg;
  bool = observer.closed;
});
observable = new Observable(observerArg => {
  observerArg.next('foo');
  observerArg.error(new Error('foo'));
  observerArg.complete();
});
observable = new Observable(() =>  teardownObject);
subscription = observable.subscribe(partialObserver);
subscription = observable.subscribe(arg => str = arg, (arg: Error) => err = arg, () => undefined);
subscription = observable.subscribe(null, null, () => undefined);
subscription = observable.subscribe(arg => str = arg, (arg: Error) => err = arg);
subscription = observable.subscribe(arg => str = arg);
let bool: boolean = subscription.closed;
subscription.unsubscribe();
observable[Symbol.observable]().subscribe(partialObserver);
subscription = Observable.mutations(new Date()).subscribe(value => str = value.toLocaleDateString());
