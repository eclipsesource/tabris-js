import {expect, mockTabris, restore, spy} from '../test';
import ClientStub from './ClientStub';
import Worker from '../../src/tabris/Worker';

describe('Worker', () => {

  let worker;
  let client;

  beforeEach(() => {
    client = new ClientStub();
    mockTabris(client);
    spy(client, 'call');
    worker = new Worker('script.js');
  });

  afterEach(restore);

  describe('Worker constructor', () => {

    it('is a function', () => expect(Worker).to.be.a('function'));

    it('declares 1 formal parameter', () => expect(Worker.length).to.equal(1));

    it('fails when script path parameter is omitted', () =>
      expect(() => new Worker()).to.throw('The Worker script path has to be of type string'));

    it('fails when script path parameter is not string', () =>
      expect(() => new Worker(123)).to.throw('The Worker script path has to be of type string'));

    it('creates Worker from script path', () => {
      worker = new Worker('script.js');

      expect(worker._nativeObject.scriptPath).to.equal('script.js');
    });

  });

  it('contains event methods', () => {
    expect(worker.addEventListener).to.be.a('function');
    expect(worker.removeEventListener).to.be.a('function');
    expect(worker.dispatchEvent).to.be.a('function');
  });

  describe('postMessage', () => {

    it('calls postMessage', () => {
      worker.postMessage();
      expect(client.calls({op: 'call'})[0].method).to.equal('postMessage');
    });

    it('calls postMessage with message', () => {
      worker.postMessage('hello world');
      const call = client.calls({op: 'call'})[0];
      expect(call.method).to.equal('postMessage');
      expect(call.parameters.message).to.equal('hello world');
    });

    it('calls postMessage with array message', () => {
      worker.postMessage(['hello world']);
      const call = client.calls({op: 'call'})[0];
      expect(call.method).to.equal('postMessage');
      expect(call.parameters.message).to.deep.equal(['hello world']);
    });

    it('calls postMessage with object message', () => {
      worker.postMessage({string: 'hello world', number: 123, array: [1, true, 'love']});
      const call = client.calls({op: 'call'})[0];
      expect(call.method).to.equal('postMessage');
      expect(call.parameters.message).to.deep.equal({string: 'hello world', number: 123, array: [1, true, 'love']});
    });

    it('does not call postMessage with illegal message content types', () => {
      expectOnMessageErrorToBeCalled(new Date());
      expectOnMessageErrorToBeCalled(new RegExp(''));
      expectOnMessageErrorToBeCalled([new RegExp('')]);
      expectOnMessageErrorToBeCalled([{no: 123, time: new Date()}]);
      expectOnMessageErrorToBeCalled(new Map());
      expectOnMessageErrorToBeCalled(new Set());
    });

    function expectOnMessageErrorToBeCalled(message) {
      let onMessageErrorListener = spy();
      worker.onmessageerror = onMessageErrorListener;

      worker.postMessage(message);

      expect(onMessageErrorListener).to.have.been.called;
    }
  });

  describe('terminate', () => {

    it('calls terminate', () => {
      worker.terminate();
      expect(client.calls({op: 'call'})[0].method).to.equal('terminate');
    });

  });

});
