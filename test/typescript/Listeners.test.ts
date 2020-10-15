import { EventObject, Listeners, ChangeListeners, PropertyChangedEvent, Observable } from 'tabris';

interface FooTarget {
  targetType: string;
  prop: string;
}

interface MyEvent {
  target: object;
  foo: string;
}

type CustomEvent = MyEvent & EventObject<object>;

interface MyFooEvent {
  foo: string;
  target: FooTarget;
}

class MyExtendedEvent extends EventObject<FooTarget> {
  public ext: string;
}

class CustomError extends Error {
  constructor() {
    super('foo');
  }
}

let type = 'myEventType';
let target: object = {};
let customTarget: {targetType: boolean} = {targetType: true};
let fooTarget: FooTarget = {targetType: 'foo', prop: 'bar'};
let ev: CustomEvent = {} as any;

const myEventListeners: Listeners<MyEvent> = new Listeners(customTarget, type);
const myFooListeners: Listeners<MyFooEvent> = new Listeners(fooTarget, type);
const targetCompatible: Listeners<MyEvent> = new Listeners(fooTarget , type);
const myExtendedEventListeners: Listeners<MyExtendedEvent> = new Listeners(fooTarget, type);
const listener: () => void = function() {};
const myEventListener: (ev: MyEvent) => void = function() {};
const myChangeEventListener: (ev: PropertyChangedEvent<FooTarget, string>) => void = function() {};
const myFooListener: (ev: MyFooEvent) => void = function() {};
const myExtendedEventListener: (ev: MyExtendedEvent) => void = function() {};
const myChangeListeners: ChangeListeners<FooTarget, 'prop'> = new ChangeListeners(fooTarget, 'prop');

// target and type
target = myEventListeners.target;
fooTarget = myFooListeners.target;
fooTarget = myChangeListeners.target;
fooTarget = myExtendedEventListeners.target;
fooTarget = myFooListeners(listener);
fooTarget = myFooListeners.once(listener);
fooTarget = myFooListeners.addListener(listener);
fooTarget = myFooListeners.removeListener(listener);
fooTarget = myFooListeners.trigger();

(async () => {
  fooTarget = await myFooListeners.triggerAsync();
  fooTarget = await myFooListeners.triggerAsync({foo: 'bar'});
})();

type = myEventListeners.type;
type = myFooListeners.type;
type = myChangeListeners.type;

// listener
myEventListeners(listener);
myEventListeners(myEventListener);
myEventListeners.once(myEventListener);
myEventListeners.addListener(myEventListener);
myEventListeners.removeListener(myEventListener);
myChangeListeners(myChangeEventListener);
myChangeListeners(myChangeEventListener);
myChangeListeners.once(myChangeEventListener);
myChangeListeners.addListener(myChangeEventListener);
myChangeListeners.removeListener(myChangeEventListener);
myFooListeners(listener);
myFooListeners(myFooListener);
myFooListeners.once(myFooListener);
myFooListeners.addListener(myFooListener);
myFooListeners.removeListener(myFooListener);
myExtendedEventListeners(listener);
myExtendedEventListeners(myExtendedEventListener);
myExtendedEventListeners.once(myExtendedEventListener);
myExtendedEventListeners.addListener(myExtendedEventListener);
myExtendedEventListeners.removeListener(myExtendedEventListener);

// trigger
const ignoreEventDataTarget = {foo: 'bar', target: fooTarget};
myEventListeners.trigger(ignoreEventDataTarget);
myEventListeners.trigger({foo: 'bar'});
myEventListeners.trigger(ev);
myChangeListeners.trigger({value: 'bar'});
myFooListeners.trigger({foo: 'bar'});
myFooListeners.trigger(ev);
myExtendedEventListeners.trigger(new MyExtendedEvent());

// promises
let promiseMyEv: Promise<MyEvent> = myEventListeners.promise();
let promiseFooEv: Promise<MyFooEvent> = myFooListeners.promise();
let promiseExtEv: Promise<MyExtendedEvent> = myExtendedEventListeners.promise();

Listeners.getListenerStore({}).on('foo', ev => console.log(ev.type));
Listeners.getListenerStore({}).once('foo', ev => console.log(ev.type));
Listeners.getListenerStore({}).off('foo', ev => console.log(ev.type));
Listeners.getListenerStore({}).trigger('foo', {});

// observable
let observable: Observable<MyFooEvent> = myFooListeners;
myFooListeners.subscribe(myFooListener).unsubscribe();
