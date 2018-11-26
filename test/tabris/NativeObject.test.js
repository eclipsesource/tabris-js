import {expect, mockTabris, spy, stub, restore} from '../test';
import NativeObject from '../../src/tabris/NativeObject';
import NativeObjectRegistry from '../../src/tabris/NativeObjectRegistry';
import NativeBridge from '../../src/tabris/NativeBridge';
import EventObject from '../../src/tabris/EventObject';
import ClientStub from './ClientStub';
import {toXML} from '../../src/tabris/Console';

describe('NativeObject', function() {

  let client;

  beforeEach(function() {
    client = new ClientStub();
    mockTabris(client);
  });

  afterEach(restore);

  describe('constructor', function() {

    it('prevents instantiation', function() {
      expect(() => {
        new NativeObject();
      }).to.throw(Error, 'Cannot instantiate abstract NativeObject');
    });

  });

  describe('_create', function() {

    let TestType, object;

    beforeEach(function() {
      TestType = class TestType extends NativeObject {};
      object = new TestType();
      client.resetCalls();
    });

    it('calls native create with properties', function() {
      NativeObject.defineProperties(TestType.prototype, {foo: 'any'});

      object._create('TestType', {foo: 23});

      const calls = client.calls({op: 'create', type: 'TestType'});
      expect(calls.length).to.equal(1);
      expect(calls[0].properties).to.eql({foo: 23});
    });

    it('translates properties', function() {
      NativeObject.defineProperties(TestType.prototype, {bar: {type: 'NativeObject'}});
      const other = new TestType();

      object._create('TestType', {bar: other});

      const properties = client.calls({op: 'create', id: object.cid})[0].properties;
      expect(properties.bar).to.equal(other.cid);
    });

  });

  describe('instance', function() {

    let TestType, object;

    beforeEach(function() {
      TestType = class TestType extends NativeObject {};
      object = new TestType();
      client.resetCalls();
      stub(console, 'warn');
      stub(console, 'debug');
    });

    it('isDisposed() returns false', function() {
      expect(object.isDisposed()).to.equal(false);
    });

    describe('set', function() {

      it('calls property setter', function() {
        const setter = spy();
        Object.defineProperty(TestType.prototype, 'foo', {set: setter});

        object.set({foo: 23});

        expect(setter).to.have.been.calledWith(23);
      });

      it('supports multiple property objects', function() {
        Object.assign(TestType.prototype, {foo: 0, bar: 0});

        object.set({foo: 23, bar: 42});

        expect(object.foo).to.equal(23);
        expect(object.bar).to.equal(42);
      });

      it('calls property setter on super class', function() {
        const setter = spy();
        Object.defineProperty(TestType.prototype, 'foo', {set: setter});
        class SubClass extends TestType {}
        object = new SubClass();

        object.set({foo: 23});

        expect(setter).to.have.been.calledWith(23);
      });

      it('does set non-existing property', function() {
        object.set({unknown: 23});

        expect(object.unknown).to.equal(23);
      });

      it('prints debug message for non-existing property', function() {
        object.set({unknown: 23});

        expect(console.debug).to.have.been.calledWith('Setting undefined property "unknown"');
      });

      it('returns self to allow chaining', function() {
        const result = object.set({foo: 23});

        expect(result).to.equal(object);
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

      beforeEach(function() {
        object.dispose();
      });

      it('isDisposed returns true', function() {
        expect(object.isDisposed()).to.equal(true);
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

});

describe('NativeObject.extend', function() {

  let client, CustomWidget;

  beforeEach(function() {
    client = new ClientStub();
    global.tabris = {
      on: () => {},
      trigger: () => {},
      _nativeObjectRegistry: new NativeObjectRegistry()
    };
    global.tabris._nativeBridge = new NativeBridge(client);
    stub(console, 'warn');
    CustomWidget = NativeObject.extend('custom.Widget');
    NativeObject.defineProperties(CustomWidget.prototype, {foo: true});
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
