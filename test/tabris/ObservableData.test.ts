import {SinonSpy} from 'sinon';
import ChangeListeners from '../../src/tabris/ChangeListeners';
import EventObject from '../../src/tabris/EventObject';
import {EventsClass} from '../../src/tabris/Events';
import Listeners from '../../src/tabris/Listeners';
import ObservableData from '../../src/tabris/ObservableData';
import {expect, restore, spy} from '../test';

describe('ObservableData', function() {

  afterEach(restore);

  describe('constructor', function() {

    it('creates instance', function() {
      expect(new ObservableData()).to.be.instanceOf(ObservableData);
    });

    it('assigns given data', function() {
      expect(new ObservableData({foo: 'bar'})).to.deep.equal({foo: 'bar'});
    });

  });

  describe('instance', function() {

    const fooSym = Symbol('foo');

    let data: ObservableData & {
      foo?: string,
      bar?: string,
      _foo?: string,
      $foo?: string,
      Foo?: string,
      [index: number]: any,
      [fooSym]?: any,
      onFooChanged?: Listeners
    };
    let listener: SinonSpy<Array<Partial<PropertyChangedEvent<object, string>>>>;
    let store: EventsClass;

    beforeEach(function() {
      data = new ObservableData();
      listener = spy();
      store = Listeners.getListenerStore(data as any);
    });

    it('fires change events when property is set', function() {
      store.on('fooChanged', listener);

      data.foo = 'baz1';
      data.bar = 'baz2';
      const event = listener.args[0][0];

      expect(data.foo).to.equal('baz1');
      expect(data.bar).to.equal('baz2');
      expect(listener.args.length).to.equal(1);
      expect(event.type).to.equal('fooChanged');
      expect(event.target).to.equal(data);
      expect(event.value).to.equal('baz1');
      expect(event.originalEvent).to.equal(null);
    });

    it('fires multiple change events for same property', function() {
      store.on('fooChanged', listener);

      data.foo = 'baz1';
      data.foo = 'baz2';
      data.foo = 'baz3';

      expect(data.foo).to.equal('baz3');
      expect(listener).to.have.been.calledThrice;
    });

    it('fires change events when property is defined', function() {
      store.on('fooChanged', listener);

      Object.defineProperties(data, {
        foo: {value: 'baz1'},
        bar: {value: 'baz2'}
      });
      const event = listener.args[0][0];

      expect(data.foo).to.equal('baz1');
      expect(data.bar).to.equal('baz2');
      expect(listener.args.length).to.equal(1);
      expect(event.type).to.equal('fooChanged');
      expect(event.target).to.equal(data);
      expect(event.value).to.equal('baz1');
      expect(event.originalEvent).to.equal(null);
    });

    it('fires change events for setter access', function() {
      Object.defineProperties(data, {
        foo: {
          get() { return this._foo; },
          set(value: string) { this._foo = value; }
        }
      });
      store.on('fooChanged', listener);

      data.foo = 'baz';

      expect(data.foo).to.equal('baz');
      expect(listener).to.have.been.calledOnce;
      expect(listener.args[0][0].type).to.equal('fooChanged');
      expect(listener.args[0][0].value).to.equal('baz');
    });

    it('fires no change events for "special" properties', function() {
      store.on('*', listener);

      data._foo = 'x';
      data.$foo = 'x';
      data.Foo = 'x';
      data[0] = 'x';
      data[fooSym] = 'x';

      expect(listener).not.to.have.been.called;
    });

    it('fires not change events when property is set to same value', function() {
      data.foo = 'baz1';
      store.on('fooChanged', listener);

      data.bar = 'baz1';

      expect(listener).not.to.have.been.called;
    });

    it('fires no change events when property is set to Listeners', function() {
      store.on('*', listener);

      data.onFooChanged = new Listeners(data, 'fooChanged');

      expect(listener).not.to.have.been.called;
    });

    it('is observable', function() {
      data[Symbol.observable]().subscribe(listener);

      data.bar = 'baz1';

      expect(listener).to.have.been.calledOnce;
      expect(listener.args[0][0]).to.be.instanceOf(EventObject);
      expect(listener.args[0][0]).to.include({
        target: data,
        type: 'barChanged',
        value: 'baz1'
      });
    });

    describe('nested', function() {

      let parent: ObservableData & {
        child?: typeof data,
        recurse?: {}
      };
      let onChildChanged: ChangeListeners<typeof parent, 'child'>;

      beforeEach(function() {
        parent = new ObservableData({child: data});
        onChildChanged = new ChangeListeners(parent, 'child');
        onChildChanged(listener);
      });

      it('fires events when nested property changes', function() {
        data.foo = 'foo';
        data.bar = 'foo';
        parent.child = null;

        expect(listener).to.have.been.calledThrice;
      });

      it('passes through change events', function() {
        data.foo = 'bar';

        const ev = listener.args[0][0] as PropertyChangedEvent<typeof parent, 'child'>;
        const originalEvent = ev.originalEvent as PropertyChangedEvent<typeof data, 'foo'>;
        expect(ev.target).to.equal(parent);
        expect(ev.value).to.equal(data);
        expect(ev.type).to.equal('childChanged');
        expect(originalEvent).to.be.instanceOf(EventObject);
        expect(originalEvent.target).to.equal(data);
        expect(originalEvent.type).to.equal('fooChanged');
        expect(originalEvent.value).to.equal('bar');
      });

      it('unsubscribes when property is cleared', function() {
        parent.child = null;
        listener.resetHistory();
        data.foo = 'bar';

        expect(listener).not.to.have.been.called;
      });

      it('handles recursion', function() {
        const inBetween = new ObservableData({child: parent});
        const recurseListener = spy();
        Listeners.getListenerStore(parent as any).on('recurseChanged', recurseListener);
        parent.recurse = inBetween;
        data.foo = 'bar';

        expect(listener).to.have.been.calledOnce;
        expect(recurseListener).to.have.been.calledTwice;
        expect(recurseListener.args[0][0].originalEvent).to.be.null;
        const originalEvent = recurseListener.args[1][0].originalEvent;
        expect(originalEvent.target).to.equal(inBetween);
        expect(originalEvent.type).to.equal('childChanged');
        expect(originalEvent.originalEvent.target).to.equal(parent);
        expect(originalEvent.originalEvent.type).to.equal('childChanged');
        expect(originalEvent.originalEvent.originalEvent.type).to.equal('fooChanged');
        expect(originalEvent.originalEvent.originalEvent.target).to.equal(data);
      });

    });

  });

  describe('subclass', function() {

    class MyData extends ObservableData {

      onFooChanged = new ChangeListeners(this, 'foo');
      onBarChanged = new ChangeListeners(this, 'bar');

      foo: string = '';
      _bar?: string = '';

      set bar(value: string) {
        this._bar = value;
      }

      get bar() {
        return this._bar;
      }

    }

    let data: MyData;
    let listener: SinonSpy<Array<Partial<PropertyChangedEvent<MyData, keyof MyData>>>>;

    beforeEach(function() {
      data = new MyData();
      listener = spy();
    });

    it('fires change events when plain property is set', function() {
      data.onFooChanged(listener);

      data.foo = 'baz1';
      data.bar = 'baz2';
      const event = listener.args[0][0];

      expect(data.foo).to.equal('baz1');
      expect(listener).to.have.been.calledOnce;
      expect(event.type).to.equal('fooChanged');
      expect(event.target).to.equal(data);
      expect(event.value).to.equal('baz1');
      expect(event.originalEvent).to.equal(null);
    });

    it('fires change events when setter is invoked', function() {
      data.onBarChanged(listener);

      data.foo = 'baz1';
      data.bar = 'baz2';

      expect(data.bar).to.equal('baz2');
      expect(listener).to.have.been.calledOnce;
      const event = listener.args[0][0];
      expect(event.type).to.equal('barChanged');
      expect(event.target).to.equal(data);
      expect(event.value).to.equal('baz2');
      expect(event.originalEvent).to.equal(null);
    });

    it('fires change events when subclass setter is invoked', function() {
      class SubMyData extends MyData {}
      data = new SubMyData();
      data.onBarChanged(listener);

      data.foo = 'baz1';
      data.bar = 'baz2';

      expect(data.bar).to.equal('baz2');
      expect(listener).to.have.been.calledOnce;
      const event = listener.args[0][0];
      expect(event.type).to.equal('barChanged');
      expect(event.target).to.equal(data);
      expect(event.value).to.equal('baz2');
      expect(event.originalEvent).to.equal(null);
    });

  });

});
