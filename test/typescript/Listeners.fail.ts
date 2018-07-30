import { EventObject, Listeners } from 'tabris';

interface FooTarget {
  targetType: string;
}

interface MyEvent {
  foo: string;
}

interface MyFooEvent {
  foo: string;
  target: FooTarget;
}

class MyExtendedEvent extends EventObject<FooTarget> {
  public ext: string;
}

const type = 'myEventType';
let target: object = {};
let customTarget: {targetType: boolean} = {targetType: true};
let fooTarget: FooTarget = {targetType: 'foo'};

const wrongTarget: Listeners<MyFooEvent> = new Listeners(target, type);
const voidListeners: Listeners = new Listeners(target, type);
const myEventListeners: Listeners<MyEvent> = new Listeners(customTarget, type);
const listener: () => void = function() {};
const myFooListeners: Listeners<MyFooEvent> = new Listeners(fooTarget, type);
const myFooListener: (ev: MyFooEvent) => void = function() {};
const myExtendedEventListener: (ev: MyExtendedEvent) => void = function() {};

// target mismatch
fooTarget = myEventListeners.target;
customTarget = myFooListeners.target;
customTarget = myEventListeners.target;
customTarget = myFooListeners(listener);
customTarget = myFooListeners.once(listener);
customTarget = myFooListeners.addListener(listener);
customTarget = myFooListeners.removeListener(listener);
customTarget = myFooListeners.trigger();

// listener mismatch
voidListeners(myFooListener);
voidListeners.once(myFooListener);
voidListeners.addListener(myFooListener);
voidListeners.removeListener(myFooListener);
myEventListeners(myExtendedEventListener);
myEventListeners.once(myExtendedEventListener);
myEventListeners.addListener(myExtendedEventListener);
myEventListeners.removeListener(myExtendedEventListener);

// trigger parameter mismatch
myEventListeners.trigger({});
myEventListeners.trigger({foo: 'bar', target: fooTarget});
myEventListeners.trigger({foo: 23});

// promised value mismatch
let promiseStr: Promise<string> = voidListeners.resolve(23);
let promiseEv: Promise<MyFooEvent> = voidListeners.resolve();

/*Expected
(25,58): error TS2345

(34,1): error TS2322
(35,1): error TS2322
(36,1): error TS2322
(37,1): error TS2322
(38,1): error TS2322
(39,1): error TS2322
(40,1): error TS2322
(41,1): error TS2322

(44,15): error TS2345
(45,20): error TS2345
(46,27): error TS2345
(47,30): error TS2345
(48,18): error TS2345
(49,23): error TS2345
(50,30): error TS2345
(51,33): error TS2345

(54,26): error TS2345
(55,39): error TS2345
(56,26): error TS2345

(59,5): error TS2322
(60,5): error TS2322
*/
