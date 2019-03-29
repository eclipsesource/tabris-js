import {expect, match, restore, spy, stub} from '../test';
import EventObject from '../../src/tabris/EventObject';
import NativeObject from '../../src/tabris/NativeObject';
import Listeners from '../../src/tabris/Listeners';

// TODO: test plain object shared listener storage

describe('Listeners', function() {

  class MyExtendedEvent extends EventObject { }
  const type = 'myEventType';
  const fooType = 'myFooEventType';
  let target;
  let fooTarget;
  let myListeners;
  let myFooListeners;
  let listener;

  beforeEach(function() {
    target = {targetType: true};
    fooTarget = {targetType: 'foo'};
    myListeners = new Listeners(target, type);
    myFooListeners = new Listeners(fooTarget, fooType);
    listener = stub();
  });

  afterEach(restore);

  it('exposes target and type', function() {
    expect(myListeners.type).to.equal(type);
    expect(myListeners.target).to.equal(target);
    expect(myFooListeners.target).to.equal(fooTarget);
  });

  it('throws for wrong target', function() {
    expect(() => new Listeners()).to.throw('Missing target instance');
    expect(() => new Listeners(null)).to.throw('Missing target instance');
    expect(() => new Listeners(true)).to.throw('Missing target instance');
  });

  it('throws for wrong type', function() {
    expect(() => new Listeners({})).to.throw('Missing event type string');
    expect(() => new Listeners({}, true)).to.throw('Missing event type string');
    expect(() => new Listeners({}, '')).to.throw('Missing event type string');
  });

  it('throws for types starting with on[UpperCase]', function() {
    const ok = new Listeners(fooTarget, 'onion');

    expect(ok.type).to.equal('onion');
    expect(() => new Listeners(fooTarget, 'onIon')).to.throw(
      'Invalid event type string, did you mean "ion"?'
    );
  });

  it('notifies directly registered listener', function() {
    myListeners.addListener(listener);

    myListeners.trigger();

    expect(listener).to.have.been.called;
  });

  it('notifies directly registered listener with data', function() {
    myListeners.addListener(listener);

    myListeners.trigger({foo: 'bar'});

    expect(listener).to.have.been.calledWithMatch({foo: 'bar'});
  });

  it('initializes event object with type, timeStamp and target', function() {
    myListeners.addListener(listener);

    myListeners.trigger({foo: 'bar'});

    expect(listener).to.have.been.calledWithMatch({foo: 'bar', target, type, timeStamp: match.number});
  });

  it('ignores type, timeStamp and target in event data', function() {
    myListeners.addListener(listener);

    myListeners.trigger({foo: 'bar', target: {}, type: 'not the type', timeStamp: 0});

    expect(listener).to.have.been.calledWithMatch({foo: 'bar', target, type, timeStamp: match.number});
  });

  it('passes through uninitialized EventObject', function() {
    myListeners.addListener(listener);
    const ev = Object.assign(new EventObject(), {foo: 'bar'});

    myListeners.trigger(ev);

    expect(listener).to.have.been.calledWith(ev);
  });

  it('passes through uninitialized custom EventObject', function() {
    myFooListeners.addListener(listener);
    const ev = Object.assign(new MyExtendedEvent(), {ext: 'bar'});

    myFooListeners.trigger(ev);

    expect(listener).to.have.been.calledWith(ev);
  });

  it('copies initialized EventObject', function() {
    const ev = Object.assign(new EventObject(), {foo: 'bar'});
    const events = [];
    myListeners.addListener(event => events.push(event));
    myFooListeners.addListener(event => events.push(event));

    myListeners.trigger(ev);
    myFooListeners.trigger(events[0]);

    expect(events.length).to.equal(2);
    expect(events[0]).to.equal(ev);
    expect(events[0].target).to.equal(target);
    expect(events[1]).not.to.equal(ev);
    expect(events[1].foo).to.equal('bar');
    expect(events[1].target).to.equal(fooTarget);
  });

  it('notifies listener with unbound trigger', function() {
    myListeners.addListener(listener);
    const trigger = myListeners.trigger;

    trigger();

    expect(listener).to.have.been.called;
  });

  it('notifies shorthand registered listener', function() {
    myListeners(listener);

    myListeners.trigger();

    expect(listener).to.have.been.called;
  });

  it('shorthand returns target', function() {
    expect(myListeners(listener)).to.equal(target);
    expect(myFooListeners(listener)).to.equal(fooTarget);
  });

  it('other methods return target', function() {
    expect(myListeners.once(listener)).to.equal(target);
    expect(myListeners.addListener(listener)).to.equal(target);
    expect(myListeners.removeListener(listener)).to.equal(target);
    expect(myListeners.trigger(listener)).to.equal(target);
  });

  it('notifies typed shorthand registered listener', function() {
    myListeners(listener);

    myListeners.trigger({foo: 'bar'});

    expect(listener).to.have.been.calledWithMatch({foo: 'bar'});
  });

  it('notifies listener only once', function() {
    myListeners(listener);
    myListeners(listener);

    myListeners.trigger();

    expect(listener).to.have.been.calledOnce;
  });

  it('does not notify removed listener', function() {
    myListeners(listener);
    myListeners.removeListener(listener);

    myListeners.trigger();

    expect(listener).not.to.have.been.called;
  });

  it('notifies listeners once ', function () {
    myListeners.once(listener);

    myListeners.trigger();
    myListeners.trigger();

    expect(listener).to.have.been.calledOnce;
  });

  it('shares listener storage', function() {
    myFooListeners(listener);
    const myFooListeners2 = new Listeners(fooTarget, fooType);

    myFooListeners2.trigger({foo: 'bar'});

    expect(listener).to.have.been.calledWithMatch({foo: 'bar'});
  });

  it('resolves previous promises', function() {
    const promise1 = myListeners.promise();
    const promise2 = myListeners.promise();

    myListeners.trigger();

    return Promise.all([promise1, promise2], (ev1, ev2) => {
      expect(ev1).to.be.instanceof(EventObject);
      expect(ev2).to.be.instanceof(EventObject);
    });
  });

  it('resolves previous typed promises', function() {
    const promise1 = myListeners.promise();
    const promise2 = myListeners.promise();

    myListeners.trigger({foo: 'bar'});

    return Promise.all([promise1, promise2], (ev1, ev2) => {
      expect(ev1).to.be.instanceof(EventObject);
      expect(ev2).to.be.instanceof(EventObject);
      expect(ev1).contains({foo: 'bar'});
      expect(ev2).contains({foo: 'bar'});
    });
  });

  it('does not resolve new promise', done => {
    myListeners.trigger({foo: 'bar'});

    myListeners.promise().then(
      () => new Error('Should not resolve'),
      () => new Error('Should not reject')
    );

    setTimeout(done, 100);
  });

  it('prints error of async listeners', done => {
    function asyncListener() {
      return Promise.reject('someError');
    }
    const errorSpy = spy(console, 'error');
    myListeners(asyncListener);

    myListeners.trigger();

    setTimeout(function() {
      errorSpy.restore();
      expect(errorSpy).to.have.been.calledWithMatch(/someError/);
      done();
    }, 100);
  });

  describe('with NativeObject target', function() {

    const PseudoNativeObject = function() {};
    PseudoNativeObject.prototype = NativeObject.prototype;
    class MyNativeObject extends PseudoNativeObject {
      constructor() {
        super();
        this.onMyEvent = new Listeners(this, 'myEvent');
      }
    }

    it('synthesizes tabris events on NativeObjects', function() {
      const object = new MyNativeObject();
      object.on({myEvent: listener});
      object.onMyEvent.trigger({});

      expect(listener).to.have.been.calledOnce;
    });

    it('receives events on NativeObjects', function() {
      const object = new MyNativeObject();
      object.onMyEvent(listener);
      object.trigger('myEvent', {foo: 'bar'});

      expect(listener).to.have.been.calledOnce;
      expect(listener).to.have.been.calledWithMatch({foo: 'bar'});
    });

    it('forwards given event object to tabris event', function() {
      const object = new MyNativeObject();
      object.on({myEvent: listener});
      const eventData = {target: object, type: 'myEvent', foo: 'bar'};
      object.onMyEvent.trigger(eventData);

      expect(listener).to.have.been.calledWithMatch({target: object, type: 'myEvent', foo: 'bar'});
    });

    it('adjusts target and type on forwarded event', function() {
      const object = new MyNativeObject();
      object.on({myEvent: listener});
      const eventData = {target: new Date(), type: 'baz', foo: 'bar'};
      object.onMyEvent.trigger(eventData);

      expect(listener).to.have.been.calledWithMatch({target: object, type: 'myEvent', foo: 'bar'});
    });

  });

});
