import {expect, spy, stub, restore} from '../test';
import NativeObject from '../../src/tabris/NativeObject';
import ClientInterface from '../../src/tabris/Tabris';
import ClientMock from './ClientMock';
import '../../src/tabris/Tabris';
import {SinonFakeTimers, SinonSpy, useFakeTimers} from 'sinon';
import EventObject from '../../src/tabris/EventObject';
import Event, {addDOMEventTargetMethods, defineEventHandlerProperties} from '../../src/tabris/Event';

describe('ClientInterface', function() {

  let tabris: ClientInterface;
  let client: ClientMock;

  beforeEach(function() {
    tabris = global.tabris = new ClientInterface();
    client = new ClientMock();
  });

  afterEach(() => {
    tabris.close();
    restore();
  });

  describe('_init', function() {

    it('can be called without a context', function() {
      expect(() => {
        tabris._init.call(null, client);
      }).to.not.throw();
    });

    it('triggers start event', function() {
      const listener = spy();
      tabris.on('start', listener);

      tabris._init.call(null, client);

      expect(listener).to.have.been.calledOnce;
    });

    it('triggers start event when tabris is set up', function() {
      class TestType extends NativeObject {
        get _nativeType() { return 'test.Type'; }
      }
      tabris.on('start', () => new TestType());

      tabris._init.call(null, client);

      expect(client.calls({op: 'create', type: 'test.Type'}).length).to.equal(1);
    });

    it('puts postMessage and close in global scope', function() {
      expect(global.postMessage).to.be.instanceOf(Function);
      expect(global.close).to.be.instanceOf(Function);
    });

    describe('with headless false', function() {

      beforeEach(function() {
        tabris._init.call(null, client, {});
      });

      it('sets headless false', function() {
        expect(tabris.headless).to.be.false;
      });

      it('ignores postMessage calls', function() {
        client.resetCalls();
        global.postMessage('foo');
        expect(client.calls().length).to.equal(0);
      });

      it('does not LISTEN to message', function() {
        expect(client.calls({
          op: 'listen',
          id: tabris.cid,
          event: 'message',
          listen: true
        }).length).to.equal(0);
      });

      it('ignores close calls', function() {
        client.resetCalls();
        global.close();
        expect(client.calls().length).to.equal(0);
      });

    });

    describe('with headless true', function() {

      beforeEach(function() {
        tabris._init.call(null, client, {headless: true});
        delete global.addEventListener;
        addDOMEventTargetMethods(global);
        defineEventHandlerProperties(global, ['message', 'messageerror', 'error']);
      });

      it('sets headless true', function() {
        expect(tabris.headless).to.be.true;
      });

      it('LISTENs to message', function() {
        expect(client.calls({
          op: 'listen',
          id: tabris.cid,
          event: 'message',
          listen: true
        }).length).to.equal(1);
      });

      it('sets default logPushInterval', function() {
        expect(tabris.logPushInterval).to.equal(-1);
      });

      describe('postMessage', function() {

        it('CALLs postMessage', function() {
          tabris.postMessage();
          expect(client.calls({op: 'call'}).length).to.equal(1);
          expect(client.calls({op: 'call'})[0].method).to.equal('postMessage');
        });

        it('CALLs postMessage from global context', function() {
          global.postMessage();
          expect(client.calls({op: 'call'})[0].method).to.equal('postMessage');
        });

        it('CALLs postMessage with data', function() {
          tabris.postMessage('hello world');
          const call = client.calls({op: 'call'})[0];
          expect(call.method).to.equal('postMessage');
          expect(call.parameters.data).to.equal('hello world');
        });

        it('CALLs postMessage with array message', function() {
          tabris.postMessage(['hello world']);
          const call = client.calls({op: 'call'})[0];
          expect(call.method).to.equal('postMessage');
          expect(call.parameters.data).to.deep.equal(['hello world']);
        });

        it('CALLs postMessage with object message', function() {
          tabris.postMessage({string: 'hello world', number: 123, array: [1, true, 'love']});
          const call = client.calls({op: 'call'})[0];
          expect(call.method).to.equal('postMessage');
          expect(call.parameters.data).to.deep.equal({string: 'hello world', number: 123, array: [1, true, 'love']});
        });

        it('does not CALL postMessage with illegal message content types', function() {
          expectTypeError(new Date());
          expectTypeError(new RegExp(''));
          expectTypeError([new RegExp('')]);
          expectTypeError([{no: 123, time: new Date()}]);
          expectTypeError(new Map());
          expectTypeError(new Set());
        });

        it('CALLs postMessage without buffered logs', function() {
          tabris.trigger('log', {level: 'debug', message: 'foo'});
          tabris.trigger('log', {level: 'debug', message: 'bar'});

          tabris.postMessage('hello world');

          const call = client.calls({op: 'call'})[0];
          expect(call.method).to.equal('postMessage');
          expect(call.parameters.logs).to.be.null;
        });

        function expectTypeError(message) {
          expect(() => tabris.postMessage(message)).to.throw(TypeError);
        }

      });

      describe('close', function() {

        it('CALLs close', function() {
          tabris.close();
          expect(client.calls({op: 'call'}).length).to.equal(1);
          expect(client.calls({op: 'call'})[0].method).to.equal('close');
        });

        it('CALLs postMessage from global context', function() {
          global.close();
          expect(client.calls({op: 'call'})[0].method).to.equal('close');
        });

      });

      describe('message event', function() {

        beforeEach(function() {
          listener = spy();
        });

        let listener: SinonSpy;

        it('triggers tabris message event', function() {
          tabris.onMessage(listener);

          tabris._notify(tabris.cid, 'message', {data: 'foo'});

          expect(listener).to.have.been.calledOnce;
          expect(listener.args[0][0]).to.be.instanceOf(EventObject);
          expect(listener.args[0][0].data).to.equal('foo');
        });

        it('triggers no event if internal is true event', function() {
          tabris.onMessage(listener);

          tabris._notify(tabris.cid, 'message', {internal: true, data: 'foo'});

          expect(listener).not.to.have.been.called;
        });

        it('calls global onmessage function with DOM Event', function() {
          global.onmessage = listener;

          tabris._notify(tabris.cid, 'message', {data: 'foo'});

          expect(listener).to.have.been.calledOnce;
          expect(listener.args[0][0]).to.be.instanceOf(Event);
          expect(listener.args[0][0].data).to.equal('foo');
        });

        it('dispatches global DOM Event', function() {
          global.addEventListener('message', listener);

          tabris._notify(tabris.cid, 'message', {data: 'foo'});

          expect(listener).to.have.been.calledOnce;
          expect(listener.args[0][0]).to.be.instanceOf(Event);
          expect(listener.args[0][0].data).to.equal('foo');
        });

      });

      describe('messageError event', function() {

        beforeEach(function() {
          listener = spy();
        });

        let listener: SinonSpy;

        it('triggers tabris messageError event', function() {
          tabris.onMessageError(listener);

          tabris._notify(tabris.cid, 'messageError', {data: 'foo'});

          expect(listener).to.have.been.calledOnce;
          expect(listener.args[0][0]).to.be.instanceOf(EventObject);
          expect(listener.args[0][0].data).to.equal('foo');
        });

        it('calls global onmessageerror function with DOM Event', function() {
          global.onmessageerror = listener;

          tabris._notify(tabris.cid, 'messageError', {data: 'foo'});

          expect(listener).to.have.been.calledOnce;
          expect(listener.args[0][0]).to.be.instanceOf(Event);
          expect(listener.args[0][0].data).to.equal('foo');
        });

        it('dispatches global DOM Event', function() {
          global.addEventListener('messageerror', listener);

          tabris._notify(tabris.cid, 'messageError', {data: 'foo'});

          expect(listener).to.have.been.calledOnce;
          expect(listener.args[0][0]).to.be.instanceOf(Event);
          expect(listener.args[0][0].data).to.equal('foo');
        });

      });

      describe('and logPushInterval 0', function() {

        beforeEach(function() {
          tabris = global.tabris = new ClientInterface();
          tabris._init.call(null, client, {headless: true});
          tabris.trigger('log', {level: 'debug', message: 'bar'});
          tabris.trigger('log', {level: 'info', message: 'foo'});
          tabris.logPushInterval = 0;
        });

        it('sets logPushInterval to 0', function() {
          expect(tabris.logPushInterval).to.equal(0);
        });

        it('includes buffered logs in next postMessage call', function() {
          tabris.postMessage('hello world');
          const call = client.calls({op: 'call'})[0];
          expect(call.parameters.logs.length).to.equal(2);
          expect(call.parameters.logs[0]).to.include({level: 'debug', message: 'bar'});
          expect(call.parameters.logs[1]).to.include({level: 'info', message: 'foo'});
          expect(call.parameters.internal).to.be.false;
        });

        it('sends logs only once', function() {
          tabris.postMessage('hello world');
          client.resetCalls();

          tabris.postMessage('hello world');

          const call = client.calls({op: 'call'})[0];
          expect(call.parameters.logs).to.be.null;
        });

        it('sends logs in internal message before termination', function() {
          tabris._notify(tabris.cid, 'message', {internal: true, data: 'terminate'});

          expect(client.calls({op: 'call'}).length).to.equal(1);
          const call = client.calls({op: 'call'})[0];
          expect(call.parameters.logs.length).to.equal(2);
          expect(call.parameters.logs[0]).to.include({level: 'debug', message: 'bar'});
          expect(call.parameters.logs[1]).to.include({level: 'info', message: 'foo'});
          expect(call.parameters.internal).to.be.true;
        });

        it('sends logs in internal message before close', function() {
          tabris.close();

          expect(client.calls({op: 'call'}).length).to.equal(2);
          expect(client.calls({op: 'call'})[0].method).to.equal('postMessage');
          expect(client.calls({op: 'call'})[1].method).to.equal('close');
          const postMessage = client.calls({op: 'call'})[0];
          expect(postMessage.parameters.logs.length).to.equal(2);
          expect(postMessage.parameters.logs[0]).to.include({level: 'debug', message: 'bar'});
          expect(postMessage.parameters.logs[1]).to.include({level: 'info', message: 'foo'});
          expect(postMessage.parameters.internal).to.be.true;
        });

      });

      describe('and logPushInterval 1000', function() {

        let clock: SinonFakeTimers;

        beforeEach(function() {
          clock = useFakeTimers();
          tabris = global.tabris = new ClientInterface();
          tabris._init.call(null, client, {headless: true});
          tabris._notify(tabris.cid, 'message', {data: {logPushInterval: 1000}, internal: true});
          tabris.trigger('log', {level: 'info', message: 'foo'});
          tabris.logPushInterval = 1000;
        });

        afterEach(function() {
          clock.restore();
        });

        it('sets logPushInterval to 1000', function() {
          expect(tabris.logPushInterval).to.equal(1000);
        });

        it('pushes buffered logs after 1000 ms in internal message', function() {
          clock.tick(1100);

          expect(client.calls({op: 'call'}).length).to.equal(1);
          const call = client.calls({op: 'call'})[0];
          expect(call.parameters.logs[0]).to.include({level: 'info', message: 'foo'});
          expect(call.parameters.internal).to.be.true;
        });

        it('includes timeStamps in logs', function() {
          const timeStamp = clock.now;
          clock.tick(1100);

          const call = client.calls({op: 'call'})[0];
          expect(call.parameters.logs[0].logTime).to.equal(timeStamp);
        });

        it('does not push old logs after a postMessage call', function() {
          tabris.postMessage('hello world');
          client.resetCalls();

          clock.tick(3000);

          expect(client.calls({op: 'call'}).length).to.equal(0);
        });

        it('does push new logs after a postMessage call', function() {
          tabris.postMessage('hello world');
          client.resetCalls();

          tabris.trigger('log', {level: 'debug', message: 'baz'});
          clock.tick(1100);

          expect(client.calls({op: 'call'}).length).to.equal(1);
          const call = client.calls({op: 'call'})[0];
          expect(call.parameters.logs[0]).to.include({level: 'debug', message: 'baz'});
          expect(call.parameters.internal).to.be.true;
        });

      });

    });

  });

  describe('contentView', function() {

    beforeEach(function() {
      tabris._init(client);
    });

    it('can not be set', function() {
      const contentView = tabris.contentView;

      tabris.contentView = null;

      expect(tabris.contentView).to.equal(contentView);
    });

  });

  describe('_notify', function() {

    class TestType extends NativeObject {
      get _nativeType() { return 'test.Type'; }
    }
    let widget;

    beforeEach(function() {
      tabris._init(client);
      widget = new TestType();
    });

    it('notifies widget', function() {
      spy(widget, '_trigger');

      tabris._notify(widget.cid, 'foo', {bar: 23});

      expect(widget._trigger).to.have.been.calledWith('foo', {bar: 23});
    });

    it('returns return value from widget', function() {
      stub(widget, '_trigger').callsFake(() => 'result');

      const result = tabris._notify(widget.cid, 'foo');

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

});
