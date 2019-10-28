import {expect, mockTabris, spy, stub, restore} from '../test';
import NativeObject from '../../src/tabris/NativeObject';
import EventObject from '../../src/tabris/EventObject';
import {types} from '../../src/tabris/property-types';
import ClientMock, {} from './ClientMock';
import {toXML} from '../../src/tabris/Console';
import ImageView from '../../src/tabris/widgets/ImageView';
import Composite from '../../src/tabris/widgets/Composite';

describe('NativeObject', function() {

  /** @type {ClientMock} */
  let client;

  /**
   * @typedef {NativeObject & {
   *   foo?: any,
   *   bar?: any
   * }} TestType
   */

  /** @type {Constructor<TestType>} */
  let TestType;

  /** @type {TestType} */
  let object;

  beforeEach(function() {
    client = new ClientMock();
    mockTabris(client);
    TestType = class extends NativeObject {
      get _nativeType() { return 'TestType'; }
    };
  });

  afterEach(restore);

  describe('constructor', function() {

    let object;

    it('prevents direct instantiation', function() {
      expect(() => {
        new NativeObject();
      }).to.throw(Error, 'Can not create instance of abstract class NativeObject');
    });

    it('calls native create with properties', function() {
      NativeObject.defineProperties(TestType.prototype, {foo: {default: null}});

      object = new TestType({foo: 23});

      const calls = client.calls({op: 'create', type: 'TestType'});
      expect(calls.length).to.equal(1);
      expect(calls[0].properties).to.eql({foo: 23});
    });

    it('translates properties', function() {
      NativeObject.defineProperties(TestType.prototype, {
        bar: {type: {convert: value => value.cid}, default: null}
      });
      const other = new TestType();
      client.resetCalls();

      object = new TestType({bar: other});

      const properties = client.calls({op: 'create', id: object.cid})[0].properties;
      expect(properties.bar).to.equal(other.cid);
    });

  });

  describe('instance', function() {

    /** @type {TestType} */
    let object;

    beforeEach(function() {
      TestType = class extends NativeObject {
        get _nativeType() { return 'TestType'; }
      };
      object = new TestType();
      client.resetCalls();
      stub(console, 'warn');
      stub(console, 'debug');
    });

    it('isDisposed() returns false', function() {
      expect(object.isDisposed()).to.equal(false);
    });

    describe('set', function() {

      it('set calls property setter', function() {
        const setter = spy();
        Object.defineProperty(TestType.prototype, 'foo', {set: setter});

        object.set({foo: 23});

        expect(setter).to.have.been.calledWith(23);
      });

      it('set calls property setter on super class', function() {
        const setter = spy();
        Object.defineProperty(TestType.prototype, 'foo', {set: setter});
        class SubClass extends TestType {}
        object = new SubClass();

        object.set({foo: 23});

        expect(setter).to.have.been.calledWith(23);
      });

      it('set supports multi-property objects', function() {
        Object.assign(TestType.prototype, {foo: 0, bar: 0});

        object.set({foo: 23, bar: 42});

        expect(object.foo).to.equal(23);
        expect(object.bar).to.equal(42);
      });

      it('does set non-existing property', function() {
        object.set({unknown: 23});

        expect(object.unknown).to.equal(23);
      });

      it('prints debug message for non-existing property', function() {
        object.set({unknown: 23});

        expect(console.warn).to.have.been.calledWithMatch('There is no setter for property "unknown"');
      });

      it('returns self to allow chaining', function() {
        const result = object.set({foo: 23});

        expect(result).to.equal(object);
      });

      it('SET unchanged property only once', function() {
        NativeObject.defineProperties(TestType.prototype, {foo: {type: types.number, default: null}});

        object.set({foo: 23});
        tabris.flush();
        object.set({foo: 23});

        expect(client.calls({op: 'set'}).length).to.equal(1);
      });

      it('throws for no argument', function() {
        expect(() => object.set()).to.throw();
      });

      it('throws for too many arguments', function() {
        expect(() => object.set({}, {})).to.throw();
      });

      it('ignores falsy argument', function() {
        expect(() => object.set(undefined)).not.to.throw();
      });

    });

    describe('_nativeSet', function() {

      it('calls native SET', function() {
        object._nativeSet('foo', 23);

        const call = client.calls()[0];
        expect(call.id).to.equal(object.cid);
        expect(call.op).to.equal('set');
        expect(call.properties).to.eql({foo: 23});
      });

      it('fails on disposed object', function() {
        object.dispose();

        expect(() => {
          object._nativeSet('foo', 23);
        }).to.throw(Error, 'Object is disposed');
      });

    });

    describe('_nativeGet', function() {

      it('calls native GET', function() {
        object._nativeGet('foo');

        const call = client.calls()[0];
        expect(call.id).to.equal(object.cid);
        expect(call.op).to.equal('get');
        expect(call.property).to.equal('foo');
      });

      it('returns value from native', function() {
        stub(client, 'get').returns(23);

        const result = object._nativeGet('foo');

        expect(result).to.equal(23);
      });

      it('fails on disposed object', function() {
        object.dispose();

        expect(() => {
          object._nativeGet('foo');
        }).to.throw(Error, 'Object is disposed');
      });

    });

    describe('_nativeCall', function() {

      it('calls native CALL', function() {
        object._nativeCall('method', {foo: 23});

        const call = client.calls()[0];
        expect(call.id).to.equal(object.cid);
        expect(call.op).to.equal('call');
        expect(call.method).to.equal('method');
        expect(call.parameters).to.eql({foo: 23});
      });

      it('returns value from native', function() {
        stub(client, 'call').returns(23);

        const result = object._nativeCall('method', {});

        expect(result).to.equal(23);
      });

      it('fails on disposed object', function() {
        object.dispose();

        expect(() => {
          object._nativeCall('foo', {});
        }).to.throw(Error, 'Object is disposed');
      });

    });

    describe('_nativeListen', function() {

      it('calls native LISTEN with true', function() {
        object._nativeListen('foo', true);

        const call = client.calls()[0];
        expect(call).to.deep.equal({op: 'listen', id: object.cid, event: 'foo', listen: true});
      });

      it('calls native LISTEN with false', function() {
        object._nativeListen('foo', false);

        const call = client.calls()[0];
        expect(call).to.deep.equal({op: 'listen', id: object.cid, event: 'foo', listen: false});
      });

      it('fails on disposed object', function() {
        object.dispose();

        expect(() => {
          object._nativeListen('foo', true);
        }).to.throw(Error, 'Object is disposed');
      });

    });

    describe('_trigger', function() {

      /** @type {sinon.SinonSpy} */
      let listener;

      beforeEach(function() {
        listener = spy();
      });

      it('notifies listeners with event arguments', function() {
        object.on('bar', listener);

        object._trigger('bar', {bar: 23});

        expect(listener).to.have.been.calledOnce;
        expect(listener).to.have.been.calledWithMatch({target: object, bar: 23});
      });

      it('notifies listeners with EventObject', function() {
        object.on('bar', listener);

        object._trigger('bar', {foo: 23});

        const event = listener.args[0][0];
        expect(event).to.be.instanceOf(EventObject);
      });

      it('includes data as read-only properties', function() {
        object.on('bar', listener);
        object._trigger('bar', {foo: 23});
        const event = listener.args[0][0];

        event.foo = 42;

        expect(event.foo).to.equal(23);
      });

      it('does not copy target, type, or timeStamp from data', function() {
        object.on('bar', listener);

        object._trigger('bar', {foo: 23, type: 'foo', target: {}, timeStamp: 42});

        const event = listener.args[0][0];
        expect(event.foo).to.equal(23);
        expect(event.type).to.equal('bar');
        expect(event.target).to.equal(object);
        expect(event.timeStamp).to.not.equal(42);
      });

    });

    describe('_triggerChangeEvent', function() {

      /** @type {sinon.SinonSpy} */
      let listener;

      beforeEach(function() {
        listener = spy();
      });

      it('notifies listeners', function() {
        object.on('fooChanged', listener);

        object._triggerChangeEvent('foo', 23);

        expect(listener).to.have.been.calledOnce;
        expect(listener).to.have.been.calledWithMatch({target: object, value: 23});
      });

      it('does not call possibly overridden _listen', function() {
        spy(object, '_listen');

        object._triggerChangeEvent('foo', 23);

        expect(object._listen).not.to.have.been.called;
      });

    });

    describe('on', function() {

      /** @type {sinon.SinonSpy} */
      let listener;

      beforeEach(function() {
        listener = spy();
        spy(object, '_listen');
      });

      it('calls _listen with true for first listener', function() {
        object.on('foo', listener);

        expect(object._listen).to.have.been.calledWith('foo', true);
      });

      it('does not call _listen for subsequent listeners for the same event', function() {
        object.on('bar', listener);
        object.on('bar', listener);

        expect(object._listen).to.have.been.calledOnce;
      });

      it('returns self to allow chaining', function() {
        const result = object.on('foo', listener);

        expect(result).to.equal(object);
      });

      it('does not fail on disposed object', function() {
        object.dispose();

        expect(() => {
          object.on('foo', listener);
        }).not.to.throw();
      });

    });

    describe('off', function() {

      /** @type {sinon.SinonSpy} */
      let listener;

      beforeEach(function() {
        listener = spy();
        object.on('foo', listener);
        spy(object, '_listen');
      });

      it('calls _listen with false for last listener removed', function() {
        object.off('foo', listener);

        expect(object._listen).to.have.been.calledOnce;
        expect(object._listen).to.have.been.calledWith('foo', false);
      });

      it('does not call _listen when other listeners exist for same event', function() {
        object.on('foo', spy());
        object.off('foo', listener);

        expect(object._listen).to.not.have.been.calledWith('foo', false);
      });

      it('returns self to allow chaining', function() {
        const result = object.off('foo', listener);

        expect(result).to.equal(object);
      });

      it('does not fail on disposed object', function() {
        object.dispose();

        expect(() => {
          object.off('foo', listener);
        }).not.to.throw();
      });

    });

    describe('dispose', function() {

      it('calls native destroy', function() {
        object.dispose();

        const destroyCall = client.calls({op: 'destroy', id: object.cid})[0];
        expect(destroyCall).not.to.be.undefined;
      });

      it('notifies dispose listeners', function() {
        const listener = spy();
        object.onDispose(listener);

        object.dispose();

        expect(listener).to.have.been.calledWithMatch({target: object});
      });

      it('notifies dispose listeners before native destroy', function() {
        object.onDispose(() => {
          expect(client.calls({op: 'destroy'}).length).to.eql(0);
        });

        object.dispose();
      });

      it('does not call native destroy twice when called twice', function() {
        object.dispose();
        object.dispose();

        expect(client.calls({op: 'destroy'}).length).to.equal(1);
      });

      it('can be called from within a dispose listener', function() {
        object.onDispose(() => object.dispose());

        expect(() => {
          object.dispose();
        }).not.to.throw();
      });

    });

    describe('when disposed', function() {

      /** @type {sinon.SinonSpy} */
      let listener;

      beforeEach(function() {
        listener = spy();
        object.on('foo', listener);
        object.dispose();
      });

      it('isDisposed returns true', function() {
        expect(object.isDisposed()).to.equal(true);
      });

      it('on prints warning', function() {
        object.on('foo', spy());

        expect(console.warn).to.have.been.calledWithMatch(
          /TestType.*: Event registration warning: Can not listen for event "foo" on disposed object/
        );
      });

      it('trigger only prints warning', function() {
        object.trigger('foo');

        expect(listener).not.to.have.been.called;
        expect(console.warn).to.have.been.calledWithMatch(
          /TestType.*: Trigger warning: Can not dispatch event "foo" on disposed object/
        );
      });

    });

    describe('toXML', function() {

      it('prints xml element', function() {
        expect(object[toXML]()).to.be.equal(`<TestType cid='${object.cid}'/>`);
      });

      it('works with disposed element', function() {
        object.dispose();
        expect(object[toXML]()).to.be.equal(`<TestType cid='${object.cid}' disposed='true'/>`);
      });

    });

  });

  describe('NativeObject.defineProperty', function() {

    beforeEach(function() {
      TestType = class extends NativeObject {
        get _nativeType() { return 'TestType'; }
      };
      object = new TestType();
      client.resetCalls();
      stub(console, 'warn');
      stub(console, 'debug');
    });

    it('throws for invalid configurations', function() {
      expect(() => NativeObject.defineProperty(TestType.prototype, 'foo', {
        // @ts-ignore
        type: Object, default: null
      })).to.throw(Error);
      expect(() => NativeObject.defineProperty(TestType.prototype, 'foo', {
        readonly: true, default: false
      })).to.throw(Error);
      expect(() => NativeObject.defineProperty(TestType.prototype, 'foo', {
        nullable: true, readonly: true
      })).to.throw(Error);
      expect(() => NativeObject.defineProperty(TestType.prototype, 'foo', {
        choice: ['foo', 'bar'], readonly: true
      })).to.throw(Error);
      expect(() => NativeObject.defineProperty(TestType.prototype, 'foo', {
        choice: ['foo'], default: 'foo'
      })).to.throw(Error);
      expect(() => NativeObject.defineProperty(TestType.prototype, 'foo', {
        choice: [], default: ''
      })).to.throw(Error);
      expect(() => NativeObject.defineProperty(TestType.prototype, 'foo', {}))
        .to.throw(Error);
    });

    it('type.convert converts value', function() {
      NativeObject.defineProperty(TestType.prototype, 'foo', {
        type: {convert: x => Math.round(x)}, default: null
      });

      object.foo = 1.2;

      expect(object.foo).to.equal(1);
    });

    it('type.encode encodes value', function() {
      NativeObject.defineProperty(TestType.prototype, 'foo', {
        type: {
          convert: x => parseInt(x, 10),
          encode: x => x - 1
        },
        default: null
      });

      object.foo = '12';

      expect(object.foo).to.equal(12);
      expect(client.calls({op: 'set', id: object.cid})[0].properties.foo).to.equal(11);
    });

    it('type.decode decodes value', function() {
      NativeObject.defineProperty(TestType.prototype, 'foo', {
        type: {decode: x => x + 1}, nocache: true
      });
      client.properties(object.cid).foo = 10;

      const result = object.foo;

      expect(result).to.equal(11);
    });

    it('type: string assignes property-types entry', function() {
      NativeObject.defineProperty(TestType.prototype, 'foo', {
        type: 'boolean', default: false
      });

      object.foo = 1;

      expect(object.foo).to.be.true;
    });

    it('type: Function generates NativeObject type', function() {
      NativeObject.defineProperty(TestType.prototype, 'foo', {
        type: ImageView, nocache: true
      });
      const widget = new ImageView();

      object.foo = widget;
      object.foo = new Composite();

      expect(object.foo).to.equal(widget);
      expect(client.calls({op: 'set', id: object.cid})[0].properties.foo).to.equal(widget.cid);
    });

    it('generate change events with converted value', function() {
      NativeObject.defineProperty(TestType.prototype, 'foo', {
        type: {convert: x => Math.round(x)}, default: null
      });
      const listener = spy();
      object.onFooChanged(listener);

      object.foo = 1.2;

      expect(listener).to.have.been.calledOnce;
      expect(listener).to.have.been.calledWithMatch({value: 1});
    });

    it('convert rejects value', function() {
      NativeObject.defineProperty(TestType.prototype, 'foo', {
        type: {convert: () => {throw new Error('bar');}}, default: null
      });

      object.foo = 1.2;

      expect(object.foo).to.be.null;
      expect(console.warn).to.have.been
        .calledWithMatch(/Ignored\sunsupported\svalue\sfor\sproperty\s"foo":\sbar/);
    });

    it('with nocache flag GETs value from native', function() {
      NativeObject.defineProperties(TestType.prototype, {foo: {type: {}, nocache: true}});
      tabris.flush();
      client.properties(object.cid).foo = 24;

      const result = object.foo;

      expect(result).to.equal(24);
    });

    it('with nocache flag caches value until flush', function() {
      NativeObject.defineProperties(TestType.prototype, {foo: {type: types.number, nocache: true}});
      tabris.flush();
      client.properties(object.cid).foo = 24;

      object.set({foo: 23});
      const result1 = object.foo;
      tabris.flush();
      client.properties(object.cid).foo = 25;
      const result2 = object.foo;
      client.properties(object.cid).foo = 26;
      const result3 = object.foo;

      expect(result1).to.equal(23);
      expect(result2).to.equal(25);
      expect(result3).to.equal(25);
    });

    it('with readonly flag does not accept any values', function() {
      NativeObject.defineProperties(TestType.prototype, {foo: {readonly: true}});

      object.set({foo: 23});

      expect(object.foo).to.be.undefined;
    });

    it('with const flag allows new value only once', function() {
      NativeObject.defineProperties(TestType.prototype, {foo: {const: true, default: null}});

      object.set({foo: 23});
      object.set({foo: 24});

      expect(object.foo).to.equal(23);
    });

    it('with const flag does not generate change events', function() {
      NativeObject.defineProperties(TestType.prototype, {foo: {const: true, default: null}});
      const listener = spy();
      object.on('fooChanged', listener);

      object.set({foo: 23});

      expect(object.onFooChanged).to.be.undefined;
      expect(listener).not.to.have.been.called;
    });

    it('omits converter for null when nullable', function() {
      /** @param {any} v */
      function neverNull(v) {
        if (v == null) {
          throw new Error();
        }
        return v + 1;
      }
      NativeObject.defineProperties(TestType.prototype, {
        foo: {type: {convert: neverNull}, default: 1},
        bar: {type: {convert: neverNull}, nullable: true, default: 1}
      });

      object.foo = 10;
      object.foo = 10;
      object.foo = null;
      object.bar = null;

      expect(object.foo).to.equal(11);
      expect(object.bar).to.be.null;
    });

    it('accepts value given in "choice"', function() {
      NativeObject.defineProperty(TestType.prototype, 'foo', {
        choice: ['bar', 'baz'], default: 'bar'
      });

      object.foo = 'baz';

      expect(object.foo).to.equal('baz');
    });

    it('rejects value not given in "choice"', function() {
      NativeObject.defineProperty(TestType.prototype, 'foo', {
        choice: ['bar', 'baz'], default: 'bar'
      });

      object.foo = 'asdf';

      expect(object.foo).to.equal('bar');
      expect(console.warn).to.have.been
        .calledWithMatch(/Ignored unsupported value for property "foo": Value must be "bar" or "baz"/);
    });

    it('accepts converted value given in "choice"', function() {
      NativeObject.defineProperty(TestType.prototype, 'foo', {
        type: {convert: v => v + 1},
        choice: [1, 2, 3],
        default: 2
      });

      object.foo = 0;

      expect(object.foo).to.equal(1);
    });

  });

  describe('NativeObject.extend', function() {

    /** @type {Constructor<NativeObject>} */
    let CustomWidget;

    beforeEach(function() {
      stub(console, 'warn');
      CustomWidget = NativeObject.extend('custom.Widget');
      NativeObject.defineProperties(CustomWidget.prototype, {foo: {default: 1}});
    });

    afterEach(restore);

    it('creates a constructor', function() {
      const instance = new CustomWidget({foo: 42});

      expect(instance).to.be.instanceof(CustomWidget);
      expect(instance).to.be.instanceof(NativeObject);
    });

    it('creates a non-empty cid', function() {
      const instance = new CustomWidget();

      expect(typeof instance.cid).to.equal('string');
      expect(instance.cid.length).to.be.above(0);
    });

    it('has no cid change event', function() {
      const instance = new CustomWidget({foo: 42});

      expect(instance.onCidChanged).to.be.undefined;
    });

    it('issues a create operation with type and properties', function() {
      const instance = new CustomWidget({foo: 23});
      const createCall = client.calls({op: 'create', id: instance.cid})[0];

      expect(createCall.type).to.equal('custom.Widget');
      expect(createCall.properties.foo).to.equal(23);
    });

  });

});
