import { EventObject, Listeners, ChangeListeners } from 'tabris';

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
const noEventData: Listeners = new Listeners(target, type);
const wrongTarget: Listeners<MyFooEvent> = new Listeners(target, type);
const voidListeners: Listeners<{target: object}> = new Listeners(target, type);
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
let promiseStr: Promise<string> = voidListeners.promise();
let promiseEv: Promise<MyFooEvent> = voidListeners.promise();

// ChangeListeners

interface ChangeEventTarget {
  prop: number
}

new ChangeListeners();
new ChangeListeners<ChangeEventTarget>();
new ChangeListeners<ChangeEventTarget, 'notaprop'>();
new ChangeListeners<ChangeEventTarget, 'prop'>({prop: '23'}, 'notaprop');
let myChangeListeners  = new ChangeListeners<ChangeEventTarget, 'prop'>({prop: 23}, 'prop');
myChangeListeners.trigger({notvalue: 23});
myChangeListeners.trigger({value: '23'});

/*Expected
(24,
(25,
(27,

(34,
(35,
(36,
(37,
(38,
(39,
(40,
(41,

(44,
(45,
(46,
(47,
(48,
(49,
(50,
(51,

(54,
(55,
(56,

(59,
(60,

(68,
(69,
(70,
(71,
(73,
(74,
*/
