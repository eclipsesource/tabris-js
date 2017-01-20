import {expect, spy, stub, restore} from '../test';
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

    let TestType;
    let widget;

    beforeEach(function() {
      tabris._init(client);
      TestType = NativeObject.extend({});
      widget = new TestType();
    });

    it('notifies widget', function() {
      spy(widget, '_trigger');

      tabris._notify(widget.cid, 'foo', {bar: 23});

      expect(widget._trigger).to.have.been.calledWith('foo', {bar: 23});
    });

    it('returns return value from widget', function() {
      stub(widget, '_trigger', () => 'result');

      let result = tabris._notify(widget.cid, 'foo');

      expect(result).to.equal('result');
    });

    it('skips events for already disposed widgets', function() {
      widget.dispose();
      spy(widget, '_trigger');

      tabris._notify(widget.cid, 'foo', {bar: 23});

      expect(widget._trigger).to.have.not.been.called;
    });

    it('silently ignores events for non-existing ids (does not crash)', function() {
      expect(() => {
        tabris._notify('no-id', 'foo', {bar: 23});
      }).to.not.throw();
    });

    it('can be called without a context', function() {
      spy(widget, '_trigger');

      tabris._notify.call(null, widget.cid, 'foo', [23, 42]);

      expect(widget._trigger).to.have.been.calledWith('foo', [23, 42]);
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
