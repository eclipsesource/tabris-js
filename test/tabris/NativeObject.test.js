import {expect, spy, stub, restore} from '../test';
import NativeObject from '../../src/tabris/NativeObject';
import ProxyStore from '../../src/tabris/ProxyStore';
import {types} from '../../src/tabris/property-types';
import NativeBridge from '../../src/tabris/NativeBridge';
import ClientStub from './ClientStub';

describe('NativeObject', function() {

  let client;
  let TestType;

  beforeEach(function() {
    client = new ClientStub();
    global.tabris = {
      on: () => {},
      _proxies: new ProxyStore()
    };
    global.tabris._nativeBridge = new NativeBridge(client);
    TestType = NativeObject.extend({
      _name: 'TestType',
      _properties: {foo: 'any', uncachedProperty: {type: 'any', nocache: true}},
      _events: {bar: true}
    });
  });

  afterEach(restore);

  describe('create', function() {

    let proxy;

    beforeEach(function() {
      proxy = new TestType();
      client.resetCalls();
    });

    it('calls native create with properties', function() {
      proxy._create({foo: 23});

      let calls = client.calls({op: 'create', type: 'TestType'});
      expect(calls.length).to.equal(1);
      expect(calls[0].properties).to.eql({foo: 23});
    });

    it('translates properties', function() {
      let other = new NativeObject('other-id');
      TestType._properties.foo.type = types.proxy;

      proxy._create({foo: other});

      let properties = client.calls({op: 'create', type: 'TestType'})[0].properties;
      expect(properties.foo).to.equal('other-id');
    });

    it('sends native set for init properties', function() {
      let CustomType = NativeObject.extend({
        _name: 'CustomType',
        _initProperties: {foo: 23},
        _properties: {bar: 'any'}
      });

      new CustomType({bar: 42});

      let properties = client.calls({op: 'create', type: 'CustomType'})[0].properties;
      expect(properties).to.eql({foo: 23, bar: 42});
    });

    it('does not raise warning for init properties', function() {
      let CustomType = NativeObject.extend({_initProperties: {foo: 23}});
      spy(console, 'warn');

      new CustomType();

      expect(console.warn).not.to.have.been.called;
    });

    it('does not modify prototype properties', function() {
      let CustomType = NativeObject.extend({_initProperties: {}});

      new CustomType({foo: 23});

      expect(CustomType._initProperties).to.eql({});
    });

  });

  describe('instance', function() {

    let proxy;

    beforeEach(function() {
      proxy = new TestType();
      client.resetCalls();
      stub(console, 'warn');
    });

    it('isDisposed() returns false', function() {
      expect(proxy.isDisposed()).to.equal(false);
    });

    describe('get', function() {

      it('calls native GET', function() {
        proxy.get('foo');

        expect(client.calls({op: 'get', id: proxy.cid})).not.to.be.empty;
      });

      it('does not call native GET for unknown properties', function() {
        proxy.get('bar');

        expect(client.calls({op: 'get', id: proxy.cid})).to.be.empty;
      });

      it('does not call native GET when disposed', function() {
        proxy.dispose();

        proxy.get('foo');

        expect(client.calls({op: 'get', id: proxy.cid})).to.be.empty;
      });

      it('prints warning when disposed', function() {
        proxy.dispose();

        proxy.get('foo');

        expect(console.warn).to.have.been.calledWithMatch(/disposed/);
      });

      it('returns uncached value from native', function() {
        stub(client, 'get').returns(23);
        proxy.set('uncachedProperty', 12);

        let result = proxy.get('uncachedProperty');

        expect(result).to.equal(23);
      });

      it('returns uncached value from default config', function() {
        TestType._properties.foo.default = 23;

        let result = proxy.get('foo');

        expect(result).to.equal(23);
      });

      it('returns cloned value from default function', function() {
        TestType._properties.foo.default = () => [];

        proxy.get('foo').push(1);

        expect(proxy.get('foo')).to.eql([]);
      });

      it('returns cached value', function() {
        proxy.set('foo', 'bar');
        spy(client, 'get');

        let result = proxy.get('foo');

        expect(client.get).not.to.have.been.called;
        expect(result).to.equal('bar');
      });

      it('returns cached value decoded', function() {
        TestType._properties.foo.type = types.color;
        proxy.set('foo', '#ff00ff');

        let result = proxy.get('foo');

        expect(result).to.equal('rgba(255, 0, 255, 1)');
      });

      it('raises no warning for unknown property', function() {
        proxy.get('unknownProperty', true);

        expect(console.warn).not.to.have.been.called;
      });

      it('decodes value if there is a decoder', function() {
        TestType._properties.foo.type = {
          decode: x => x + '-decoded'
        };
        stub(client, 'get').returns(23);

        let result = proxy.get('foo');

        expect(result).to.equal('23-decoded');
        expect(console.warn).not.to.have.been.called;
      });

      it('returns undefined on disposed object', function() {
        proxy.set('foo', 23);
        proxy.dispose();

        expect(proxy.get('foo')).to.be.undefined;
      });

      it ('returns undefined for unset property', function() {
        expect(proxy.get('foo')).to.be.undefined;
      });

      it ('returns default value if property was never set', function() {
        TestType._properties.foo = {default: 'bar'};

        expect(proxy.get('foo')).to.equal('bar');
      });

      it ('does not return default value if property was set', function() {
        TestType._properties.foo = {default: 'bar'};

        proxy.set('foo', 'something else');

        expect(proxy.get('foo')).to.equal('something else');
      });

      it ('calls custom getter with property name', function() {
        let getter = spy();
        proxy.set('foo', 'bar');
        TestType._properties.foo = {get: getter};

        proxy.get('foo');

        expect(getter).to.have.been.calledWith('foo');
      });

      it ('returns value from custom getter', function() {
        TestType._properties.foo = {get: stub().returns('bar')};

        expect(proxy.get('foo')).to.equal('bar');
      });

    });

    describe('set', function() {

      let listener;

      beforeEach(function() {
        listener = spy();
      });

      it('calls native SET', function() {
        proxy.set('foo', 23);

        expect(client.calls({op: 'set', id: proxy.cid}).length).to.equal(1);
      });

      it('does not call native SET if disposed', function() {
        proxy.dispose();

        proxy.set('foo', 23);

        expect(client.calls({op: 'set', id: proxy.cid})).to.be.empty;
      });

      it('prints warning if disposed', function() {
        proxy.dispose();

        proxy.set('foo', 23);

        expect(console.warn).to.have.been.calledWithMatch(/disposed/);
      });

      it ('stores single property', function() {
        proxy.set('foo', 'bar');
        expect(proxy.get('foo')).to.equal('bar');
      });

      it ('stores multiple properties', function() {
        proxy.set({foo: 'bar', foo2: 'bar2'});
        expect(proxy.get('foo')).to.equal('bar');
        expect(proxy.get('foo2')).to.equal('bar2');
      });

      it('translation does not modify properties', function() {
        let other = new NativeObject('other-id');
        let properties = {foo: other};

        proxy.set(properties);

        expect(properties.foo).to.equal(other);
      });

      it('raises no warning for unknown property', function() {
        proxy.set('unknownProperty', true);

        expect(console.warn).not.to.have.been.called;
      });

      it('stores unknown property loacally', function() {
        proxy.set('unknownProperty', 'foo');

        expect(client.calls({op: 'set', id: proxy.cid})).to.be.empty;
        expect(proxy.get('unknownProperty')).to.equal('foo');
      });

      it('does not call native SET if _properties entry references a function that throws', function() {
        TestType._properties.knownProperty = {type: 'boolean'};
        stub(types.boolean, 'encode').throws(new Error('My Error'));

        proxy.set('knownProperty', 'foo');

        expect(client.calls({op: 'set'})).to.be.empty;
      });

      it('returns self to allow chaining', function() {
        let result = proxy.set('foo', 23);

        expect(result).to.equal(proxy);
      });

      it('triggers change event for known properties', function() {
        TestType._properties.foo = {type: 'any', default: ''};
        proxy.on('change:foo', listener);

        proxy.set('foo', 'bar');

        expect(listener).to.have.been.calledWith(proxy, 'bar');
      });

      it('triggers change event with decoded property value', function() {
        TestType._properties.foo = {type: types.color};
        proxy.on('change:foo', listener);

        proxy.set('foo', '#ff00ff');

        expect(listener.args[0][1]).to.equal('rgba(255, 0, 255, 1)');
      });

      it('triggers no change event if value is unchanged from default', function() {
        TestType._properties.foo = {type: 'any', default: ''};
        proxy.on('change:foo', listener);

        proxy.set('foo', '');

        expect(listener).not.to.have.been.called;

      });

      it('triggers no change event if value is unchanged from previous value', function() {
        TestType._properties.foo = {type: 'any', default: ''};
        proxy.set('foo', 'bar');
        proxy.on('change:foo', listener);

        proxy.set('foo', 'bar');

        expect(listener).not.to.have.been.called;
      });

      it('always triggers initial change event for cached properties without default', function() {
        TestType._properties.foo = {type: 'any'};
        proxy.on('change:foo', listener);

        proxy.set('foo', 'bar');
        proxy.set('foo', 'bar');

        expect(listener).to.have.been.calledOnce;
      });

      it ('triggers change event', function() {
        proxy.on('change:foo', listener);

        proxy.set('foo', 'bar');

        expect(listener).to.have.been.calledOnce;
        expect(listener).to.have.been.calledWith(proxy, 'bar');
      });

      it ('triggers change event with decoded value', function() {
        TestType._properties.foo = {type: types.boolean};
        proxy.on('change:foo', listener);

        proxy.set('foo', 'bar');

        expect(listener).to.have.been.calledOnce;
        expect(listener).to.have.been.calledWith(proxy, true);
      });

      it ('(single parameter) triggers change event', function() {
        proxy.on('change:foo', listener);

        proxy.set({foo: 'bar'});

        expect(listener).to.have.been.calledOnce;
        expect(listener).to.have.been.calledWith(proxy, 'bar');
      });

      it ('triggers no change event if value is unchanged', function() {
        proxy.set('foo', 'bar');
        proxy.on('change:foo', listener);

        proxy.set('foo', 'bar');

        expect(listener).to.have.not.been.called;
      });

      it ('triggers no change event if encoded value is unchanged', function() {
        TestType._properties.foo = {type: types.boolean};
        proxy.set('foo', true);
        proxy.on('change:foo', listener);

        proxy.set('foo', 'bar');

        expect(listener).to.have.not.been.called;
      });

      it ('calls custom setter', function() {
        let setter = stub();
        TestType._properties.foo = {set: setter};
        proxy.set('foo', 'bar');

        expect(setter).to.have.been.calledWith('foo', 'bar');
      });

      it ('stores nothing if custom setter exists', function() {
        TestType._properties.foo = {set: () => {}};
        proxy.set('foo', 'bar');

        expect(proxy.get('foo')).to.equal(undefined);
      });

      it('calls encoding function if present', function() {
        TestType._properties.knownProperty = {type: {
          encode: stub().returns(true)
        }};

        proxy.set('knownProperty', true);

        expect(TestType._properties.knownProperty.type.encode).to.have.been.called;
        expect(console.warn).to.have.not.been.called;
      });

      it('raises a warning if encoding function throws', function() {
        TestType._properties.knownProperty = {type: {
          encode: stub().throws(new Error('My Error'))
        }};

        proxy.set('knownProperty', true);

        let message = 'TestType: Ignored unsupported value for property "knownProperty": My Error';
        expect(console.warn).to.have.been.calledWith(message);
      });

    });

    describe('_nativeSet', function() {

      it('calls native SET', function() {
        proxy._nativeSet('foo', 23);

        let call = client.calls()[0];
        expect(call.id).to.equal(proxy.cid);
        expect(call.op).to.equal('set');
        expect(call.properties).to.eql({foo: 23});
      });

      it('fails on disposed object', function() {
        proxy.dispose();

        expect(() => {
          proxy._nativeSet('foo', 23);
        }).to.throw(Error, 'Object is disposed');
      });

    });

    describe('_nativeGet', function() {

      it('calls native GET', function() {
        proxy._nativeGet('foo');

        let call = client.calls()[0];
        expect(call.id).to.equal(proxy.cid);
        expect(call.op).to.equal('get');
        expect(call.property).to.equal('foo');
      });

      it('returns value from native', function() {
        stub(client, 'get').returns(23);

        let result = proxy._nativeGet('foo');

        expect(result).to.equal(23);
      });

      it('fails on disposed object', function() {
        proxy.dispose();

        expect(() => {
          proxy._nativeGet('foo');
        }).to.throw(Error, 'Object is disposed');
      });

    });

    describe('_nativeCall', function() {

      it('calls native CALL', function() {
        proxy._nativeCall('method', {foo: 23});

        let call = client.calls()[0];
        expect(call.id).to.equal(proxy.cid);
        expect(call.op).to.equal('call');
        expect(call.method).to.equal('method');
        expect(call.parameters).to.eql({foo: 23});
      });

      it('returns value from native', function() {
        stub(client, 'call').returns(23);

        let result = proxy._nativeCall('method', {});

        expect(result).to.equal(23);
      });

      it('fails on disposed object', function() {
        proxy.dispose();

        expect(() => {
          proxy._nativeCall('foo', {});
        }).to.throw(Error, 'Object is disposed');
      });

    });

    describe('_nativeListen', function() {

      it('calls native LISTEN', function() {
        proxy._nativeListen('foo', true);

        let call = client.calls()[0];
        expect(call.id).to.equal(proxy.cid);
        expect(call.op).to.equal('listen');
        expect(call.event).to.equal('foo');
        expect(call.listen).to.be.true;
      });

      it('fails on disposed object', function() {
        proxy.dispose();

        expect(() => {
          proxy._nativeListen('foo', true);
        }).to.throw(Error, 'Object is disposed');
      });

    });

    describe('on', function() {

      let listener;

      beforeEach(function() {
        listener = spy();
        client.resetCalls();
      });

      it('calls native listen (true) for first listener', function() {
        proxy.on('bar', listener);

        let call = client.calls({op: 'listen', event: 'bar'})[0];
        expect(call.listen).to.eql(true);
      });

      it('calls native listen with translated event name', function() {
        let CustomType = NativeObject.extend({_events: {foo: 'bar'}});
        proxy = new CustomType();
        proxy.on('foo', listener);

        let call = client.calls({op: 'listen'})[0];
        expect(call.event).to.equal('bar');
      });

      it('calls native listen (true) for first alias listener', function() {
        let CustomType = NativeObject.extend({_events: {foo: {name: 'bar', alias: 'foo1'}}});
        proxy = new CustomType();

        proxy.on('foo1', listener);

        let call = client.calls({op: 'listen', event: 'bar'})[0];
        expect(call.listen).to.eql(true);
      });

      it('calls custom listen', function() {
        TestType._events.bar.listen = spy();

        proxy.on('bar', listener);

        expect(TestType._events.bar.listen).to.have.been.calledWith(true, false);
      });

      it('calls custom listen with alias flag', function() {
        let CustomType = NativeObject.extend({
          _events: {foo: {alias: 'foo1', listen: spy()}}
        });
        proxy = new CustomType();

        proxy.on('foo1', listener);

        expect(CustomType._events.foo.listen).to.have.been.calledWith(true, true);
      });

      it('calls native listen for another listener for another event', function() {
        TestType._events.bar = {name: 'bar'};

        proxy.on('foo', listener);
        proxy.on('bar', listener);

        let call = client.calls({op: 'listen', event: 'bar'})[0];
        expect(call.listen).to.eql(true);
      });

      it('does not call native listen for subsequent listeners for the same event', function() {
        proxy.on('bar', listener);
        proxy.on('bar', listener);

        expect(client.calls({op: 'listen'}).length).to.equal(1);
      });

      it('does not call native listen for subsequent listeners for alias event', function() {
        let CustomType = NativeObject.extend({_events: {foo: {alias: 'bar'}}});
        proxy = new CustomType();
        proxy.on('foo', listener);
        proxy.on('bar', listener);

        expect(client.calls({op: 'listen'}).length).to.equal(1);
      });

      it('does not call native listen for subsequent listeners for aliased event', function() {
        let CustomType = NativeObject.extend({_events: {foo: {alias: 'bar'}}});
        proxy = new CustomType();
        proxy.on('bar', listener);
        proxy.on('foo', listener);

        expect(client.calls({op: 'listen'}).length).to.equal(1);
      });

      it('returns self to allow chaining', function() {
        let result = proxy.on('foo', listener);

        expect(result).to.equal(proxy);
      });

      it('does not fail on disposed object', function() {
        proxy.dispose();

        expect(() => {
          proxy.on('foo', listener);
        }).not.to.throw();
      });

    });

    describe('off', function() {

      let listener, listener2;

      beforeEach(function() {
        listener = spy();
        listener2 = spy();
        proxy.on('bar', listener);
        client.resetCalls();
      });

      it('calls native listen (false) for last listener removed', function() {
        proxy.off('bar', listener);

        let call = client.calls({op: 'listen', event: 'bar'})[0];
        expect(call.listen).to.equal(false);
      });

      it('calls native listen (false) for last alias listener removed', function() {
        let CustomType = NativeObject.extend({_events: {foo: {alias: 'bar'}}});
        proxy = new CustomType();
        proxy.on('bar', listener);

        proxy.off('bar', listener);

        let call = client.calls({op: 'listen', event: 'foo'})[1];
        expect(call.listen).to.equal(false);
      });

      it('calls native listen with translated event name', function() {
        let CustomType = NativeObject.extend({_events: {foo: 'bar'}});
        proxy = new CustomType();
        proxy.on('foo', listener);
        proxy.off('foo', listener);

        let call = client.calls({op: 'listen'})[1];
        expect(call.event).to.equal('bar');
      });

      it('does not call native listen when other listeners exist for same event', function() {
        proxy.on('bar', listener2);
        proxy.off('bar', listener);

        expect(client.calls()).to.be.empty;
      });

      it('does not call native listen when other listeners exist for alias event', function() {
        let CustomType = NativeObject.extend({_events: {foo: {alias: 'bar'}}});
        proxy = new CustomType();
        proxy.on('foo', listener);
        proxy.on('bar', listener);
        client.resetCalls();

        proxy.off('foo', listener);

        expect(client.calls()).to.be.empty;
      });

      it('does not call native listen when other listeners exist for aliased event', function() {
        let CustomType = NativeObject.extend({_events: {foo: {alias: 'bar'}}});
        proxy = new CustomType();
        proxy.on('foo', listener);
        proxy.on('bar', listener);
        client.resetCalls();

        proxy.off('bar', listener);

        expect(client.calls()).to.be.empty;
      });

      it('calls native listen when not other listeners exist for aliased or alias event', function() {
        let CustomType = NativeObject.extend({_events: {foo: {alias: 'bar'}}});
        proxy = new CustomType();
        proxy.on('foo', listener);
        proxy.on('bar', listener);
        client.resetCalls();

        proxy.off('bar', listener);
        proxy.off('foo', listener);

        expect(client.calls().length).to.equal(1);
      });

      it('calls native listen when not other listeners exist for aliased or alias event (reversed off)', function() {
        let CustomType = NativeObject.extend({_events: {foo: {alias: 'bar'}}});
        proxy = new CustomType();
        proxy.on('foo', listener);
        proxy.on('bar', listener);
        client.resetCalls();

        proxy.off('foo', listener);
        proxy.off('bar', listener);

        expect(client.calls().length).to.equal(1);
      });

      it('returns self to allow chaining', function() {
        let result = proxy.off('foo', listener);

        expect(result).to.equal(proxy);
      });

      it('does not fail on disposed object', function() {
        proxy.dispose();

        expect(() => {
          proxy.off('foo', listener);
        }).not.to.throw();
      });

    });

    describe('dispose', function() {

      it('calls native destroy', function() {
        proxy.dispose();

        let destroyCall = client.calls({op: 'destroy', id: proxy.cid})[0];
        expect(destroyCall).not.to.be.undefined;
      });

      it('notifies dispose listeners', function() {
        let listener = spy();
        proxy.on('dispose', listener);

        proxy.dispose();

        expect(listener).to.have.been.calledWith(proxy, {});
      });

      it('notifies dispose listeners before native destroy', function() {
        proxy.on('dispose', () => {
          expect(client.calls({op: 'destroy'}).length).to.eql(0);
        });

        proxy.dispose();
      });

      it('does not call native destroy twice when called twice', function() {
        proxy.dispose();
        proxy.dispose();

        expect(client.calls({op: 'destroy'}).length).to.equal(1);
      });

      it('can be called from within a dispose listener', function() {
        proxy.on('dispose', () => proxy.dispose());

        expect(() => {
          proxy.dispose();
        }).not.to.throw();
      });

    });

    describe('when disposed', function() {

      beforeEach(function() {
        proxy.dispose();
      });

      it('isDisposed returns true', function() {
        expect(proxy.isDisposed()).to.equal(true);
      });

    });

  });

});

describe('NativeObject.extend', function() {

  let nativeBridge;

  beforeEach(function() {
    nativeBridge = new ClientStub();
    global.tabris = {
      on: () => {},
      _proxies: new ProxyStore()
    };
    global.tabris._nativeBridge = new NativeBridge(nativeBridge);
    stub(console, 'warn');
  });

  afterEach(restore);

  it('creates a constructor', function() {
    let CustomType = NativeObject.extend({});

    let instance = new CustomType({foo: 42});

    expect(instance).to.be.instanceof(CustomType);
    expect(instance).to.be.instanceof(NativeObject);
  });

  it('adds members to new type', function() {
    let CustomType = NativeObject.extend({foo: 23});

    let instance = new CustomType();

    expect(instance.foo).to.equal(23);
  });

  it('adds JS property setters', function() {
    let type = {encode: function() {}, decode: function() {}};
    let CustomType = NativeObject.extend({_properties: {foo: {type: type}}});
    let instance = new CustomType();
    spy(instance, 'set');

    instance.foo = 'bar';

    expect(instance.set).to.have.been.calledWith('foo', 'bar');
  });

  it('adds JS property getters', function() {
    let type = {encode: function() {}, decode: function() {}};
    let CustomType = NativeObject.extend({_properties: {foo: {type: type}}});
    let instance = new CustomType();
    stub(instance, 'get').returns('bar');

    let result = instance.foo;

    expect(result).to.equal('bar');
  });

  it('adds empty trigger map to constructor', function() {
    let CustomType = NativeObject.extend({});
    let instance = new CustomType();

    expect(instance.constructor._trigger).to.eql({});
  });

  it('adds _events to constructor', function() {
    let CustomType = NativeObject.extend({_events: {foo: 'bar'}});
    let instance = new CustomType();

    expect(instance.constructor._events.foo).to.eql({name: 'bar'});
    expect(instance._events).to.equal(NativeObject.prototype._events);
  });

  it('adds normalized _events to constructor', function() {
    let CustomType = NativeObject.extend({_events: {foo: 'bar', foo2: {alias: 'foo3'}}});
    let instance = new CustomType();

    expect(instance.constructor._events.foo).to.eql({name: 'bar'});
    expect(instance.constructor._events.foo2).to.eql({name: 'foo2', alias: 'foo3', originalName: 'foo2'});
    expect(instance.constructor._events.foo3).to.equal(instance.constructor._events.foo2);
    expect(instance._events).not.to.equal(instance.constructor._events);
  });

  it('adds empty events map to constructor', function() {
    let CustomType = NativeObject.extend({});
    let instance = new CustomType();

    expect(instance.constructor._events).to.eql({});
  });

  it('adds _properties to constructor', function() {
    let type = {encode: function() {}, decode: function() {}};
    let CustomType = NativeObject.extend({_properties: {foo: {type: type}}});
    let instance = new CustomType();

    expect(instance.constructor._properties.foo.type).to.equal(type);
  });

  it('replaces type strings with type definition object', function() {
    let CustomType = NativeObject.extend({_properties: {foo: {type: 'boolean'}}});
    let instance = new CustomType();

    expect(instance.constructor._properties.foo.type).to.equal(types.boolean);
  });

  it('wraps encode function if type is given as an array', function() {
    let type = ['choice', ['a', 'b', 'c']];
    spy(types.choice, 'encode');
    let CustomType = NativeObject.extend({_properties: {foo: type}});
    let instance = new CustomType();

    instance.set('foo', 'bar');

    expect(types.choice.encode).to.have.been.calledWith('bar', ['a', 'b', 'c']);
    expect(instance.constructor._properties.foo.type.encode)
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
    expect(instance.constructor._properties.foo.type.decode)
      .not.to.equal(types.bounds.decode);
  });

  it('throws if type string is not found in PropertyTypes object', function() {
    expect(() => {
      NativeObject.extend({_properties: {foo: {type: 'nothing'}}});
    }).to.throw();
  });

  it('adds normalized _properties to constructor', function() {
    let CustomType = NativeObject.extend({_properties: {foo: 'boolean'}});
    let instance = new CustomType();

    expect(instance.constructor._properties.foo.type).to.equal(types.boolean);
  });

  it('adds empty properties map to constructor', function() {
    let CustomType = NativeObject.extend({});
    let instance = new CustomType();

    expect(instance.constructor._properties).to.eql({});
  });

  it('adds _type to constructor', function() {
    let CustomType = NativeObject.extend({_type: 'foo'});
    let instance = new CustomType();

    expect(instance.constructor._type).to.equal('foo');
    expect(instance._type).to.be.undefined;
  });

  describe('constructor', function() {

    let TestType;

    beforeEach(function() {
      TestType = NativeObject.extend({_name: 'TestType', _properties: {foo: 'any'}});
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
      let createCall = nativeBridge.calls({op: 'create', id: proxy.cid})[0];

      expect(createCall.type).to.equal('TestType');
      expect(createCall.properties.foo).to.equal(23);
    });

    it('triggers a create operation with _type if present', function() {
      let CustomType = NativeObject.extend({_type: 'foo.Type'});
      new CustomType();

      expect(nativeBridge.calls({op: 'create'})[0].type).to.equal('foo.Type');
    });

    it('cannot be called as a function', function() {
      expect(() => {
        TestType({foo: 42});
      }).to.throw(Error, 'Cannot call constructor as a function');
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

      expect(nativeBridge.calls({op: 'create'})).to.be.empty;
    });

    it('prevents multiple instances', function() {
      new ServiceType();

      expect(() => {
        new ServiceType();
      }).to.throw(Error, /cid.*foo/);
    });

  });

});
