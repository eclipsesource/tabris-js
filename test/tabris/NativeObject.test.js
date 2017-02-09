import {expect, spy, stub, restore} from '../test';
import NativeObject from '../../src/tabris/NativeObject';
import ProxyStore from '../../src/tabris/ProxyStore';
import {types} from '../../src/tabris/property-types';
import NativeBridge from '../../src/tabris/NativeBridge';
import ClientStub from './ClientStub';

describe('NativeObject', function() {

  let client;

  beforeEach(function() {
    client = new ClientStub();
    global.tabris = {
      on: () => {},
      _proxies: new ProxyStore()
    };
    global.tabris._nativeBridge = new NativeBridge(client);
  });

  afterEach(restore);

  describe('constructor', function() {

    it('prevents instantiation', function() {
      expect(() => {
        new NativeObject();
      }).to.throw(Error, 'Cannot instantiate abstract NativeObject');
    });

  });

  describe('create', function() {

    let TestType, object;

    beforeEach(function() {
      TestType = NativeObject.extend({
        _properties: {foo: 'any'}
      });
      object = new TestType();
      client.resetCalls();
    });

    it('calls native create with properties', function() {
      object._create('TestType', {foo: 23});

      let calls = client.calls({op: 'create', type: 'TestType'});
      expect(calls.length).to.equal(1);
      expect(calls[0].properties).to.eql({foo: 23});
    });

    it('translates properties', function() {
      let other = new TestType();
      other.$properties.foo.type = types.proxy;

      object._create('TestType', {foo: other});
      let properties = client.calls({op: 'create', id: object.cid})[0].properties;
      expect(properties.foo).to.equal(other.cid);
    });

  });

  describe('instance', function() {

    let TestType, object;

    beforeEach(function() {
      TestType = NativeObject.extend({
        _name: 'TestType',
        _events: {bar: true}
      });
      object = new TestType();
      client.resetCalls();
      stub(console, 'warn');
    });

    it('isDisposed() returns false', function() {
      expect(object.isDisposed()).to.equal(false);
    });

    describe('get', function() {

      it('calls property getter', function() {
        Object.defineProperty(TestType.prototype, 'foo', {get: () => 23});

        let result = object.get('foo');

        expect(result).to.equal(23);
      });

      it('calls property getter on super class', function() {
        Object.defineProperty(TestType.prototype, 'foo', {get: () => 23});
        class SubType extends TestType {}
        object = new SubType();

        let result = object.get('foo');

        expect(result).to.equal(23);
      });

      it('returns undefined for non-existing property', function() {
        let result = object.get('unknown');

        expect(result).to.be.undefined;
      });

    });

    describe('set', function() {

      it('calls property setter', function() {
        let setter = spy();
        Object.defineProperty(TestType.prototype, 'foo', {set: setter});

        object.set('foo', 23);

        expect(setter).to.have.been.calledWith(23);
      });

      it('supports property objects', function() {
        Object.assign(TestType.prototype, {foo: 0, bar: 0});

        object.set({foo: 23, bar: 42});

        expect(object.foo).to.equal(23);
        expect(object.bar).to.equal(42);
      });

      it('calls property setter on super class', function() {
        let setter = spy();
        Object.defineProperty(TestType.prototype, 'foo', {set: setter});
        class SubClass extends TestType {}
        object = new SubClass();

        object.set('foo', 23);

        expect(setter).to.have.been.calledWith(23);
      });

      it('does not set non-existing property', function() {
        object.set('unknown', 23);

        expect(object.unknown).to.be.undefined;
      });

      it('prints warnings for non-existing property', function() {
        object.set('unknown', 23);

        expect(console.warn).to.have.been.calledWith('Unknown property "unknown"');
      });

      it('returns self to allow chaining', function() {
        let result = object.set('foo', 23);

        expect(result).to.equal(object);
      });

    });

    describe('_nativeSet', function() {

      it('calls native SET', function() {
        object._nativeSet('foo', 23);

        let call = client.calls()[0];
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

        let call = client.calls()[0];
        expect(call.id).to.equal(object.cid);
        expect(call.op).to.equal('get');
        expect(call.property).to.equal('foo');
      });

      it('returns value from native', function() {
        stub(client, 'get').returns(23);

        let result = object._nativeGet('foo');

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

        let call = client.calls()[0];
        expect(call.id).to.equal(object.cid);
        expect(call.op).to.equal('call');
        expect(call.method).to.equal('method');
        expect(call.parameters).to.eql({foo: 23});
      });

      it('returns value from native', function() {
        stub(client, 'call').returns(23);

        let result = object._nativeCall('method', {});

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

      it('calls native LISTEN', function() {
        object._nativeListen('foo', true);

        let call = client.calls()[0];
        expect(call.id).to.equal(object.cid);
        expect(call.op).to.equal('listen');
        expect(call.event).to.equal('foo');
        expect(call.listen).to.be.true;
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

      it('notifies listeners', function() {
        object.on('bar', listener);

        object._trigger('bar', {bar: 23});

        expect(listener).to.have.been.calledWith({bar: 23});
      });

      it('notifies listeners with translated event name', function() {
        let CustomType = NativeObject.extend({_events: {bar: 'foo'}});
        let object = new CustomType();
        object.on('bar', listener);

        object._trigger('foo', {});

        expect(listener).to.have.been.calledWith({});
      });

      it('calls custom trigger function', function() {
        let triggerFn = spy();
        let CustomType = NativeObject.extend({
          _events: {bar: {trigger: triggerFn}}
        });
        let object = new CustomType();

        object._trigger('bar', {bar: 23});

        expect(triggerFn).to.have.been.calledWith('bar', {bar: 23});
      });

      it('calls custom trigger function with empty events object', function() {
        let triggerFn = spy();
        let CustomType = NativeObject.extend({
          _events: {bar: {trigger: triggerFn}}
        });
        let object = new CustomType();

        object._trigger('bar');

        expect(triggerFn).to.have.been.calledWith('bar', {});
      });

      it('returns result from custom trigger', function() {
        let CustomType = NativeObject.extend({
          _events: {bar: {trigger: spy(() => 'result')}}
        });
        let object = new CustomType();

        let result = object._trigger('bar');

        expect(result).to.equal('result');
      });

      it('calls custom trigger function of translated event', function() {
        let triggerFn = spy();
        let CustomType = NativeObject.extend({
          _events: {bar: {name: 'foo', trigger: triggerFn}}
        });
        let object = new CustomType();

        object._trigger('foo', {bar: 23});

        expect(triggerFn).to.have.been.calledWith('bar', {bar: 23});
      });

      it('returns return value from custom trigger with translated event', function() {
        let CustomType = NativeObject.extend({
          _events: {bar: {name: 'foo', trigger: spy(() => 'result')}}
        });
        let object = new CustomType();
        spy(object, 'trigger');

        let result = object._trigger('foo');

        expect(result).to.equal('result');
      });

    });

    describe('on', function() {

      let listener;

      beforeEach(function() {
        listener = spy();
        client.resetCalls();
      });

      it('calls native listen (true) for first listener', function() {
        object.on('bar', listener);

        let call = client.calls({op: 'listen', event: 'bar'})[0];
        expect(call.listen).to.eql(true);
      });

      it('calls native listen with translated event name', function() {
        let CustomType = NativeObject.extend({_events: {foo: 'bar'}});
        object = new CustomType();
        object.on('foo', listener);

        let call = client.calls({op: 'listen'})[0];
        expect(call.event).to.equal('bar');
      });

      it('calls native listen (true) for first alias listener', function() {
        let CustomType = NativeObject.extend({_events: {foo: {name: 'bar', alias: 'foo1'}}});
        object = new CustomType();

        object.on('foo1', listener);

        let call = client.calls({op: 'listen', event: 'bar'})[0];
        expect(call.listen).to.eql(true);
      });

      it('calls native listen function for another listener for another event', function() {
        let CustomType = NativeObject.extend({
          _events: {bar: {name: 'bar'}}
        });
        object = new CustomType();

        object.on('foo', listener);
        object.on('bar', listener);

        let call = client.calls({op: 'listen', event: 'bar'})[0];
        expect(call.listen).to.eql(true);
      });

      it('does not call native listen for subsequent listeners for the same event', function() {
        object.on('bar', listener);
        object.on('bar', listener);

        expect(client.calls({op: 'listen'}).length).to.equal(1);
      });

      it('does not call native listen for subsequent listeners for alias event', function() {
        let CustomType = NativeObject.extend({_events: {foo: {alias: 'bar'}}});
        object = new CustomType();
        object.on('foo', listener);
        object.on('bar', listener);

        expect(client.calls({op: 'listen'}).length).to.equal(1);
      });

      it('does not call native listen for subsequent listeners for aliased event', function() {
        let CustomType = NativeObject.extend({_events: {foo: {alias: 'bar'}}});
        object = new CustomType();
        object.on('bar', listener);
        object.on('foo', listener);

        expect(client.calls({op: 'listen'}).length).to.equal(1);
      });

      it('returns self to allow chaining', function() {
        let result = object.on('foo', listener);

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

      let listener, listener2;

      beforeEach(function() {
        listener = spy();
        listener2 = spy();
        object.on('bar', listener);
        client.resetCalls();
      });

      it('calls native listen (false) for last listener removed', function() {
        object.off('bar', listener);

        let call = client.calls({op: 'listen', event: 'bar'})[0];
        expect(call.listen).to.equal(false);
      });

      it('calls native listen (false) for last alias listener removed', function() {
        let CustomType = NativeObject.extend({_events: {foo: {alias: 'bar'}}});
        object = new CustomType();
        object.on('bar', listener);

        object.off('bar', listener);

        let call = client.calls({op: 'listen', event: 'foo'})[1];
        expect(call.listen).to.equal(false);
      });

      it('calls native listen with translated event name', function() {
        let CustomType = NativeObject.extend({_events: {foo: 'bar'}});
        object = new CustomType();
        object.on('foo', listener);
        object.off('foo', listener);

        let call = client.calls({op: 'listen'})[1];
        expect(call.event).to.equal('bar');
      });

      it('does not call native listen when other listeners exist for same event', function() {
        object.on('bar', listener2);
        object.off('bar', listener);

        expect(client.calls()).to.be.empty;
      });

      it('does not call native listen when other listeners exist for alias event', function() {
        let CustomType = NativeObject.extend({_events: {foo: {alias: 'bar'}}});
        object = new CustomType();
        object.on('foo', listener);
        object.on('bar', listener);
        client.resetCalls();

        object.off('foo', listener);

        expect(client.calls()).to.be.empty;
      });

      it('does not call native listen when other listeners exist for aliased event', function() {
        let CustomType = NativeObject.extend({_events: {foo: {alias: 'bar'}}});
        object = new CustomType();
        object.on('foo', listener);
        object.on('bar', listener);
        client.resetCalls();

        object.off('bar', listener);

        expect(client.calls()).to.be.empty;
      });

      it('calls native listen when not other listeners exist for aliased or alias event', function() {
        let CustomType = NativeObject.extend({_events: {foo: {alias: 'bar'}}});
        object = new CustomType();
        object.on('foo', listener);
        object.on('bar', listener);
        client.resetCalls();

        object.off('bar', listener);
        object.off('foo', listener);

        expect(client.calls().length).to.equal(1);
      });

      it('calls native listen when not other listeners exist for aliased or alias event (reversed off)', function() {
        let CustomType = NativeObject.extend({_events: {foo: {alias: 'bar'}}});
        object = new CustomType();
        object.on('foo', listener);
        object.on('bar', listener);
        client.resetCalls();

        object.off('foo', listener);
        object.off('bar', listener);

        expect(client.calls().length).to.equal(1);
      });

      it('returns self to allow chaining', function() {
        let result = object.off('foo', listener);

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

        let destroyCall = client.calls({op: 'destroy', id: object.cid})[0];
        expect(destroyCall).not.to.be.undefined;
      });

      it('notifies dispose listeners', function() {
        let listener = spy();
        object.on('dispose', listener);

        object.dispose();

        expect(listener).to.have.been.calledWith(object, {});
      });

      it('notifies dispose listeners before native destroy', function() {
        object.on('dispose', () => {
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
        object.on('dispose', () => object.dispose());

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

  });

});

describe('NativeObject.extend', function() {

  let client;

  beforeEach(function() {
    client = new ClientStub();
    global.tabris = {
      on: () => {},
      _proxies: new ProxyStore()
    };
    global.tabris._nativeBridge = new NativeBridge(client);
    stub(console, 'warn');
  });

  afterEach(restore);

  it('creates a constructor', function() {
    let CustomType = NativeObject.extend({});

    let instance = new CustomType({foo: 42});

    expect(instance).to.be.instanceof(CustomType);
    expect(instance).to.be.instanceof(NativeObject);
  });

  it('throws for unsupported config options', function() {
    expect(() => NativeObject.extend({foo: 23})).to.throw();
  });

  it('adds property setters', function() {
    let type = {encode: spy(), decode: spy()};
    let CustomType = NativeObject.extend({_properties: {foo: {type}}});
    let instance = new CustomType();

    instance.foo = 23;

    expect(type.encode).to.have.been.calledWith(23);
  });

  it('adds property getters', function() {
    let CustomType = NativeObject.extend({_properties: {foo: {type: 'number', default: 23}}});
    let instance = new CustomType();

    let result = instance.foo;

    expect(result).to.equal(23);
  });

  it('adds empty trigger map to prototype', function() {
    let CustomType = NativeObject.extend({});
    let instance = new CustomType();

    expect(instance.$trigger).to.eql({});
  });

  it('adds events map to prototype', function() {
    let CustomType = NativeObject.extend({_events: {foo: 'bar'}});
    let instance = new CustomType();

    expect(instance.$events.foo).to.eql({name: 'bar'});
    expect(instance._events).to.equal(NativeObject.prototype._events);
  });

  it('adds normalized events map to prototype', function() {
    let CustomType = NativeObject.extend({_events: {foo: 'bar', foo2: {alias: 'foo3'}}});
    let instance = new CustomType();

    expect(instance.$events.foo).to.eql({name: 'bar'});
    expect(instance.$events.foo2).to.eql({name: 'foo2', alias: 'foo3', originalName: 'foo2'});
    expect(instance.$events.foo3).to.equal(instance.$events.foo2);
  });

  it('adds empty events map to prototype', function() {
    let CustomType = NativeObject.extend({});
    let instance = new CustomType();

    expect(instance.$events).to.eql({});
  });

  it('adds properties map to prototype', function() {
    let type = {encode() {}, decode() {}};
    let CustomType = NativeObject.extend({_properties: {foo: {type}}});
    let instance = new CustomType();

    expect(instance.$properties.foo.type).to.equal(type);
  });

  it('replaces type strings with type definition object', function() {
    let CustomType = NativeObject.extend({_properties: {foo: {type: 'boolean'}}});
    let instance = new CustomType();

    expect(instance.$properties.foo.type).to.equal(types.boolean);
  });

  it('wraps encode function if type is given as an array', function() {
    let type = ['choice', ['a', 'b', 'c']];
    spy(types.choice, 'encode');
    let CustomType = NativeObject.extend({_properties: {foo: type}});
    let instance = new CustomType();

    instance.set('foo', 'bar');

    expect(types.choice.encode).to.have.been.calledWith('bar', ['a', 'b', 'c']);
    expect(instance.$properties.foo.type.encode)
      .not.to.equal(types.choice.encode);
  });

  it('wraps decode function if type is given as an array', function() {
    let type = ['bounds', ['customarg']];
    stub(types.bounds, 'encode').returns('bar');
    spy(types.bounds, 'decode');
    let CustomType = NativeObject.extend({_properties: {foo: type}});
    let instance = new CustomType();
    instance.set('foo', 'bar');

    instance.get('foo');

    expect(types.bounds.decode).to.have.been.calledWith('bar', ['customarg']);
    expect(instance.$properties.foo.type.decode)
      .not.to.equal(types.bounds.decode);
  });

  it('throws if type string is not found in PropertyTypes object', function() {
    expect(() => {
      NativeObject.extend({_properties: {foo: {type: 'nothing'}}});
    }).to.throw();
  });

  it('adds normalized properties map to prototype', function() {
    let CustomType = NativeObject.extend({_properties: {foo: 'boolean'}});
    let instance = new CustomType();

    expect(instance.$properties.foo.type).to.equal(types.boolean);
  });

  it('adds empty properties map to prototype', function() {
    let CustomType = NativeObject.extend({});
    let instance = new CustomType();

    expect(instance.$properties).to.eql({});
  });

  describe('constructor', function() {

    let TestType;

    beforeEach(function() {
      TestType = NativeObject.extend({_type: 'TestType', _properties: {foo: 'any'}});
    });

    it('fails if tabris.js not yet started', function() {
      global.tabris._ready = false;
      delete tabris._nativeBridge;

      expect(() => {
        new TestType();
      }).to.throw(Error, 'tabris.js not started');
    });

    it('creates a non-empty cid', function() {
      let proxy = new TestType();

      expect(typeof proxy.cid).to.equal('string');
      expect(proxy.cid.length).to.be.above(0);
    });

    it('assigns cid as read-only property', function() {
      let proxy = new TestType();
      let cid = proxy.cid;

      proxy.cid = 4711;

      expect(proxy.cid).to.equal(cid);
    });

    it('creates different cids for subsequent calls', function() {
      let proxy1 = new TestType();
      let proxy2 = new TestType();

      expect(proxy1.cid).not.to.equal(proxy2.cid);
    });

    it('creates an instance of NativeObject', function() {
      let result = new TestType();

      expect(result).to.be.instanceof(TestType);
    });

    it('triggers a create operation with type and properties', function() {
      let proxy = new TestType({foo: 23});
      let createCall = client.calls({op: 'create', id: proxy.cid})[0];

      expect(createCall.type).to.equal('TestType');
      expect(createCall.properties.foo).to.equal(23);
    });

    it('triggers a create operation with _type if present', function() {
      let CustomType = NativeObject.extend({_type: 'foo.Type'});
      new CustomType();

      expect(client.calls({op: 'create'})[0].type).to.equal('foo.Type');
    });

    it('cannot be called as a function', function() {
      expect(() => {
        TestType({foo: 42});
      }).to.throw(Error, 'Class constructor Type cannot be invoked without \'new\'');
    });

  });

  describe('constructor for singletons', function() {

    let ServiceType;

    beforeEach(function() {
      ServiceType = NativeObject.extend({_cid: 'foo'});
    });

    it('respects _cid', function() {
      let instance = new ServiceType();

      expect(instance).to.be.instanceof(ServiceType);
      expect(instance.cid).to.equal('foo');
    });

    it('does not call create for service objects', function() {
      new ServiceType();

      expect(client.calls({op: 'create'})).to.be.empty;
    });

    it('prevents multiple instances', function() {
      new ServiceType();

      expect(() => {
        new ServiceType();
      }).to.throw(Error, /cid.*foo/);
    });

  });

  describe('property getter', function() {

    let TestType, object;

    beforeEach(function() {
      TestType = NativeObject.extend({
        _name: 'TestType',
        _properties: {foo: 'any', uncached: {type: 'any', nocache: true}}
      });
      object = new TestType();
    });

    it('calls native GET', function() {
      object.foo;

      expect(client.calls({op: 'get', id: object.cid})).not.to.be.empty;
    });

    it('does not call native GET when disposed', function() {
      object.dispose();

      object.foo;

      expect(client.calls({op: 'get', id: object.cid})).to.be.empty;
    });

    it('prints warning when disposed', function() {
      object.dispose();

      object.foo;

      expect(console.warn).to.have.been.calledWithMatch('Cannot get property "foo" on disposed object');
    });

    it('returns uncached value from native', function() {
      stub(client, 'get').returns(23);
      object.uncached = 12;

      expect(object.uncached).to.equal(23);
    });

    it('returns uncached value from default config', function() {
      object.$properties.foo.default = 23;

      expect(object.foo).to.equal(23);
    });

    it('returns cloned value from default function', function() {
      object.$properties.foo.default = () => [];

      object.foo.push(1);

      expect(object.foo).to.eql([]);
    });

    it('returns cached value', function() {
      object.foo = 'bar';
      spy(client, 'get');

      let result = object.foo;

      expect(client.get).not.to.have.been.called;
      expect(result).to.equal('bar');
    });

    it('returns cached value decoded', function() {
      object.$properties.foo.type = types.color;
      object.foo = '#ff00ff';

      expect(object.foo).to.equal('rgba(255, 0, 255, 1)');
    });

    it('decodes value if there is a decoder', function() {
      object.$properties.foo.type = {
        decode: x => x + '-decoded'
      };
      stub(client, 'get').returns(23);

      let result = object.foo;

      expect(result).to.equal('23-decoded');
      expect(console.warn).not.to.have.been.called;
    });

    it('returns undefined on disposed object', function() {
      object.foo = 23;
      object.dispose();

      expect(object.foo).to.be.undefined;
    });

    it('returns undefined for unset property', function() {
      expect(object.foo).to.be.undefined;
    });

    it('returns default value if property was never set', function() {
      object.$properties.foo = {default: 'bar'};

      expect(object.foo).to.equal('bar');
    });

    it('does not return default value if property was set', function() {
      object.$properties.foo = {default: 'bar'};

      object.foo = 'something else';

      expect(object.foo).to.equal('something else');
    });

    it('calls custom getter with property name', function() {
      let getter = spy();
      object.$properties.foo = {get: getter};

      object.foo;

      expect(getter).to.have.been.calledWith('foo');
    });

    it('returns value from custom getter', function() {
      object.$properties.foo = {get: stub().returns('bar')};

      expect(object.foo).to.equal('bar');
    });

  });

  describe('property setter', function() {

    class TestType extends NativeObject.extend({
      _name: 'TestType',
      _properties: {foo: 'any', uncached: {type: 'any', nocache: true}}
    }) {}
    let object, listener;

    beforeEach(function() {
      object = new TestType();
      listener = spy();
      client.resetCalls();
    });

    it('calls native SET', function() {
      object.foo = 23;

      expect(client.calls({op: 'set', id: object.cid})).not.to.be.empty;
    });

    it('does not call native SET if disposed', function() {
      object.dispose();

      object.foo = 23;

      expect(client.calls({op: 'set', id: object.cid})).to.be.empty;
    });

    it('prints warning if disposed', function() {
      object.dispose();

      object.foo = 23;

      expect(console.warn).to.have.been.calledWith('Cannot set property "foo" on disposed object');
    });

    it('does not call native SET if encoder function throws', function() {
      object.$properties.knownProperty = {type: 'boolean'};
      stub(types.boolean, 'encode').throws(new Error('My Error'));

      object.knownProperty = 'foo';

      expect(client.calls({op: 'set'})).to.be.empty;
    });

    it('triggers change event', function() {
      object.on('change:foo', listener);

      object.foo = 23;

      expect(listener).to.have.been.calledOnce;
      expect(listener).to.have.been.calledWith(object, 23);
    });

    it('triggers change event with decoded value', function() {
      object.$properties.foo = {type: types.boolean};
      object.on('change:foo', listener);

      object.foo = 23;

      expect(listener).to.have.been.calledOnce;
      expect(listener).to.have.been.calledWith(object, true);
    });

    it('triggers no change event if value is unchanged', function() {
      object.foo = 23;
      object.on('change:foo', listener);

      object.foo = 23;

      expect(listener).to.have.not.been.called;
    });

    it('triggers no change event if value is unchanged from default', function() {
      object.$properties.foo = {type: 'any', default: 0};
      object.on('change:foo', listener);

      object.foo = 0;

      expect(listener).not.to.have.been.called;
    });

    it('triggers no change event if encoded value is unchanged', function() {
      object.$properties.foo = {type: types.boolean};
      object.set('foo', true);
      object.on('change:foo', listener);

      object.foo = 23;

      expect(listener).to.have.not.been.called;
    });

    it('calls custom setter', function() {
      let setter = spy();
      object.$properties.foo = {set: setter};

      object.foo = 23;

      expect(setter).to.have.been.calledWith('foo', 23);
    });

    it('stores nothing if custom setter exists', function() {
      object.$properties.foo = {set: () => {}};

      object.foo = 23;

      expect(object.foo).to.be.undefined;
    });

    it('calls encoding function if present', function() {
      let encode = spy();
      object.$properties.foo = {type: {encode}};

      object.foo = true;

      expect(encode).to.have.been.called;
    });

    it('raises a warning if encoding function throws', function() {
      let encode = stub().throws(new Error('My Error'));
      object.$properties.foo = {type: {encode}};

      object.foo = true;

      let message = 'TestType: Ignored unsupported value for property "foo": My Error';
      expect(console.warn).to.have.been.calledWith(message);
    });

  });

});
