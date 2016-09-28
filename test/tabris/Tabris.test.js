import {expect, spy, restore} from '../test';
import NativeObject from '../../src/tabris/NativeObject';
import ClientInterface from '../../src/tabris/Tabris';
import ClientStub from './ClientStub';
import '../../src/tabris/Tabris';

describe('ClientInterface', function() {

  let tabris;
  let client;

  beforeEach(function() {
    tabris = global.tabris = new ClientInterface();
    client = new ClientStub();
  });

  afterEach(restore);

  describe('_init', function() {

    it('can be called without a context', function() {
      expect(() => {
        tabris._init.call(null, client);
      }).to.not.throw();
    });

    it('executes all load functions', function() {
      let f1 = spy();
      let f2 = spy();
      tabris.load(f1);
      tabris.load(f2);

      tabris._init.call(null, client);

      expect(f1).to.have.been.called;
      expect(f2).to.have.been.called;
      expect(f1).to.have.been.calledBefore(f2);
    });

    it('load functions can access tabris functions', function() {
      let TestType = NativeObject.extend({_type: 'test.Type'});
      tabris.load(() => new TestType());

      tabris._init.call(null, client);

      expect(client.calls({op: 'create', type: 'test.Type'}).length).to.equal(1);
    });

  });

  describe('_notify', function() {

    let CustomType;
    let proxy;

    beforeEach(function() {
      tabris._init(client);
    });

    it('notifies widget proxy', function() {
      CustomType = NativeObject.extend({_events: {bar: true}});
      proxy = new CustomType();
      spy(proxy, 'trigger');

      tabris._notify(proxy.cid, 'bar', {bar: 23});

      expect(proxy.trigger).to.have.been.calledWith('bar', {bar: 23});
    });

    it('notifies widget proxy with translated event name', function() {
      CustomType = NativeObject.extend({_events: {bar: 'foo'}});
      proxy = new CustomType();
      spy(proxy, 'trigger');

      tabris._notify(proxy.cid, 'foo', {});

      expect(proxy.trigger).to.have.been.calledWith('bar', {});
    });

    it('calls custom trigger', function() {
      CustomType = NativeObject.extend({

        _events: {
          bar: {
            trigger: spy()
          }
        }
      });
      proxy = new CustomType();
      spy(proxy, 'trigger');

      tabris._notify(proxy.cid, 'bar', {bar: 23});

      expect(CustomType._events.bar.trigger).to.have.been.calledWith({bar: 23}, 'bar');
    });

    it('returns return value from custom trigger', function() {
      CustomType = NativeObject.extend({

        _events: {
          bar: {
            trigger: spy(() => 'foo')
          }
        }
      });
      proxy = new CustomType();
      spy(proxy, 'trigger');

      let returnValue = tabris._notify(proxy.cid, 'bar');

      expect(returnValue).to.equal('foo');
    });

    it('calls custom trigger of translated event', function() {
      CustomType = NativeObject.extend({

        _events: {
          bar: {
            name: 'foo',
            trigger: spy()
          }
        }
      });
      proxy = new CustomType();
      spy(proxy, 'trigger');

      tabris._notify(proxy.cid, 'foo', {bar: 23});

      expect(CustomType._events.bar.trigger).to.have.been.calledWith({bar: 23}, 'bar');
    });

    it('returns return value from custom trigger with translated event', function() {
      CustomType = NativeObject.extend({

        _events: {
          bar: {
            name: 'foo',
            trigger: spy(() => 'foobar')
          }
        }
      });
      proxy = new CustomType();
      spy(proxy, 'trigger');

      let returnValue = tabris._notify(proxy.cid, 'foo');

      expect(returnValue).to.equal('foobar');
    });

    it('skips events for already disposed widgets', function() {
      CustomType = NativeObject.extend({_events: {bar: true}});
      proxy = new CustomType();
      proxy.dispose();
      spy(proxy, 'trigger');

      tabris._notify(proxy.cid, 'bar', {bar: 23});

      expect(proxy.trigger).to.have.not.been.called;
    });

    it('silently ignores events for non-existing ids (does not crash)', function() {
      expect(() => {
        tabris._notify('no-id', 'foo', [23, 42]);
      }).to.not.throw();
    });

    it('can be called without a context', function() {
      CustomType = NativeObject.extend({_events: {bar: true}});
      proxy = new CustomType();
      spy(proxy, 'trigger');

      tabris._notify.call(null, proxy.cid, 'bar', [23, 42]);

      expect(proxy.trigger).to.have.been.calledWith('bar', [23, 42]);
    });

  });

  describe('load', function() {

    beforeEach(function() {
      delete tabris._nativeBridge;
      tabris._ready = false;
    });

    it('function is not executed before start time', function() {
      let fn = spy();
      tabris.load(fn);

      expect(fn).to.have.not.been.called;
    });

    it('function is executed at start time', function() {
      let fn = spy();

      tabris.load(fn);
      tabris._init(client);

      expect(fn).to.have.been.called;
    });

    it('nested load functions are executed at the end', function() {
      let log = [];

      tabris.load(function() {
        log.push('1');
        tabris.load(function() {
          log.push('1a');
        });
        tabris.load(function() {
          log.push('1b');
        });
      });
      tabris.load(function() {
        log.push('2');
      });
      tabris._init(client);

      expect(log).to.eql(['1', '2', '1a', '1b']);
    });

    it('runs immediately if already started', function() {
      let fn = spy();

      tabris._init(client);
      tabris.load(fn);

      expect(fn).to.have.been.called;
    });

  });

});
