import {expect, mockTabris, restore, spy} from '../test';
import ClientMock from './ClientMock';
import Worker from '../../src/tabris/Worker';
import {SinonSpy} from 'sinon';
import Event from '../../src/tabris/Event';

describe('Worker', function() {

  let worker: Worker;
  let client: ClientMock;

  beforeEach(function() {
    client = new ClientMock();
    mockTabris(client);
    spy(client as any, 'call');
    tabris.logPushInterval = 100;
    worker = new Worker('script.js');
  });

  afterEach(function() {
    delete global.onmessage;
    restore();
  });

  describe('Worker constructor', function() {

    it('is a function', () => expect(Worker).to.be.a('function'));

    it('declares 1 formal parameter', () => expect(Worker.length).to.equal(1));

    it('fails when script path parameter is omitted', () =>
      expect(() => new (Worker as any)()).to.throw('The Worker script path has to be of type string'));

    it('fails when script path parameter is not string', () =>
      expect(() => new Worker(123 as unknown as any)).to.throw('The Worker script path has to be of type string'));

    it('creates Worker from script path', function() {
      expect(worker._nativeObject.scriptPath).to.equal('script.js');
    });

  });

  it('contains event methods', function() {
    expect(worker.addEventListener).to.be.a('function');
    expect(worker.removeEventListener).to.be.a('function');
    expect(worker.dispatchEvent).to.be.a('function');
  });

  describe('postMessage', function() {

    beforeEach(function() {
      client.resetCalls();
    });

    it('CALLs postMessage', function() {
      worker.postMessage();
      expect(client.calls({op: 'call'})[0].method).to.equal('postMessage');
    });

    it('CALLs postMessage with message', function() {
      worker.postMessage('hello world');
      const call = client.calls({op: 'call'})[0];
      expect(call.method).to.equal('postMessage');
      expect(call.parameters.data).to.equal('hello world');
    });

    it('CALLs postMessage with array message', function() {
      worker.postMessage(['hello world']);
      const call = client.calls({op: 'call'})[0];
      expect(call.method).to.equal('postMessage');
      expect(call.parameters.data).to.deep.equal(['hello world']);
    });

    it('CALLs postMessage with object message', function() {
      worker.postMessage({string: 'hello world', number: 123, array: [1, true, 'love']});
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

    function expectTypeError(message) {
      expect(() => worker.postMessage(message)).to.throw(TypeError);
    }

  });

  describe('terminate', function() {

    beforeEach(function() {
      client.resetCalls();
    });

    it('calls internal postMessage', function() {
      worker.terminate();
      const call = client.calls({op: 'call'})[0];
      expect(call.method).to.equal('postMessage');
      expect(call.parameters.internal).to.be.true;
      expect(call.parameters.data).to.equal('terminate');
    });

    it('calls terminate', function() {
      worker.terminate();
      expect(client.calls({op: 'call'})[1].method).to.equal('terminate');
    });

  });

  describe('message event', function() {

    beforeEach(function() {
      client.resetCalls();
      listener = spy();
    });

    let listener: SinonSpy;

    it('calls worker onmessage function with DOM Event', function() {
      worker.onmessage = listener;

      tabris._notify(worker._nativeObject.cid, 'message', {data: 'foo'});

      expect(listener).to.have.been.calledOnce;
      expect(listener.args[0][0]).to.be.instanceOf(Event);
      expect(listener.args[0][0].data).to.equal('foo');
    });

    it('dispatches DOM Event', function() {
      worker.addEventListener('message', listener);

      tabris._notify(worker._nativeObject.cid, 'message', {data: 'foo'});

      expect(listener).to.have.been.calledOnce;
      expect(listener.args[0][0]).to.be.instanceOf(Event);
      expect(listener.args[0][0].data).to.equal('foo');
    });

    it('dispatches no Event when internal is true', function() {
      worker.addEventListener('message', listener);

      tabris._notify(worker._nativeObject.cid, 'message', {data: 'foo', internal: true});

      expect(listener).not.to.have.been.called;
    });

    it('dispatches log Events when included', function() {
      tabris.on('log', listener);

      tabris._notify(worker._nativeObject.cid, 'message', {
        internal: true,
        logs: [
          {level: 'info', message: 'foo', logTime: 100001},
          {level: 'debug', message: 'bar', logTime: 10002}
        ]
      });

      expect(listener).to.have.been.calledTwice;
      expect(listener).to.have.been.calledWithMatch(
        {level: 'info', message: 'foo', logTime: 100001}
      );
      expect(listener).to.have.been.calledWithMatch(
        {level: 'debug', message: 'bar', logTime: 10002}
      );
    });

  });

});
