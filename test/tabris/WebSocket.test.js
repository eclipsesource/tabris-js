import {expect, mockTabris, spy, stub, restore} from '../test';
import ClientStub from './ClientStub';
import WebSocket from '../../src/tabris/WebSocket';
import Event from '../../src/tabris/Event';

describe('WebSocket', function() {

  let webSocket;
  let client;

  beforeEach(function() {
    client = new ClientStub();
    mockTabris(client);
    spy(client, 'call');
    webSocket = new WebSocket('ws://url.com', 'chat-protocol');
  });

  afterEach(restore);

  describe('WebSocket constructor', function() {

    it('is a function', function() {
      expect(WebSocket).to.be.a('function');
    });

    it('declares 2 formal parameters', function() {
      expect(WebSocket.length).to.equal(2);
    });

    it('fails when url parameter is omitted', function() {
      expect(() => new WebSocket())
        .to.throw('The WebSocket url has to be of type string');
    });

    it('fails when url parameter is not string', function() {
      expect(() => new WebSocket(123))
        .to.throw('The WebSocket url has to be of type string');
    });

    it("fails when scheme of url parameter is not 'ws' or 'wss'", function() {
      expect(() => new WebSocket('http://url.com'))
        .to.throw("The WebSocket url has to have a scheme of 'ws' or 'wss' but is 'http'");
    });

    it('fails when protocol is omitted', function() {
      expect(() => new WebSocket('ws://url.com'))
        .to.throw('The WebSocket protocol has too be a string or an array of strings');
    });

    it('fails when protocol is not string', function() {
      expect(() => new WebSocket('ws://url.com', 123))
        .to.throw('The WebSocket protocol has too be a string or an array of strings');
    });

    it('creates WebSocket from url and protocol', function() {
      webSocket = new WebSocket('ws://url.com', 'chat-protocol');

      expect(webSocket.url).to.equal('ws://url.com');
      expect(webSocket.protocol).to.equal(''); // empty string until 'open' has been called
    });

    it('creates WebSocket from url and array of protocols', function() {
      webSocket = new WebSocket('ws://url.com', ['chat-protocol', 'communication-protocol']);

      expect(webSocket.url).to.equal('ws://url.com');
      expect(webSocket.protocol).to.equal(''); // empty string until 'open' has been called
    });

  });

  it('contains event methods', function() {
    expect(webSocket.addEventListener).to.be.a('function');
    expect(webSocket.removeEventListener).to.be.a('function');
    expect(webSocket.dispatchEvent).to.be.a('function');
  });

  describe('open event', function() {

    it('sets readyState to OPEN', function() {
      tabris._notify(webSocket._nativeObject.cid, 'open', {});

      expect(webSocket.readyState).to.equal(webSocket.OPEN);
    });

    it('sets protocol to protocol parameter', function() {
      tabris._notify(webSocket._nativeObject.cid, 'open', {protocol: 'chat-protocol'});

      expect(webSocket.protocol).to.equal('chat-protocol');
    });

    it('sets extensions to extensions parameter', function() {
      tabris._notify(webSocket._nativeObject.cid, 'open', {extensions: 'compress'});

      expect(webSocket.extensions).to.equal('compress');
    });

    it('notifies onopen listener', function() {
      const listener = spy();
      webSocket.onopen = listener;

      tabris._notify(webSocket._nativeObject.cid, 'open', {protocol: 'chat-protocol', extensions: 'compress'});

      expect(listener).to.have.been.calledWithMatch({
        target: webSocket,
        protocol: 'chat-protocol',
        extensions: 'compress'
      });
      expect(listener.firstCall.args[0]).to.be.instanceOf(Event);
    });

  });

  describe('message event', function() {

    it('notifies onmessage listener', function() {
      const listener = spy();
      webSocket.onmessage = listener;
      tabris._notify(webSocket._nativeObject.cid, 'open', {data: 'message'});

      tabris._notify(webSocket._nativeObject.cid, 'message', {data: 'message'});

      expect(listener).to.have.been.calledWithMatch({target: webSocket, data: 'message'});
      expect(listener.firstCall.args[0]).to.be.instanceOf(Event);
    });

  });

  describe('close event', function() {

    it('sets readyState to CLOSED', function() {
      tabris._notify(webSocket._nativeObject.cid, 'close', {});

      expect(webSocket.readyState).to.equal(webSocket.CLOSED);
    });

    it('notifies onclose listener', function() {
      const listener = spy();
      webSocket.onclose = listener;

      tabris._notify(webSocket._nativeObject.cid, 'close', {});

      expect(listener).to.have.been.calledWithMatch({target: webSocket});
      expect(listener.firstCall.args[0]).to.be.instanceOf(Event);
    });

  });

  describe('error event', function() {

    it('sets readyState to CLOSED', function() {
      tabris._notify(webSocket._nativeObject.cid, 'error', {});

      expect(webSocket.readyState).to.equal(webSocket.CLOSED);
    });

    it('notifies onerror listener', function() {
      const listener = spy();
      webSocket.onerror = listener;

      tabris._notify(webSocket._nativeObject.cid, 'error', {});

      expect(listener).to.have.been.calledWithMatch({target: webSocket});
      expect(listener.firstCall.args[0]).to.be.instanceOf(Event);
    });

  });

  describe('bufferedAmount', function() {

    it('set does not call set on client', function() {
      stub(console, 'warn');

      webSocket.bufferedAmount = 123;

      expect(client.call).to.have.not.been.called;
    });

    it('set prints warning to console', function() {
      stub(console, 'warn');

      webSocket.bufferedAmount = 123;

      expect(console.warn).to.have.not.been.calledWith('Can not set read-only property');
    });

    it('get calls getter', function() {
      stub(client, 'get').returns(128);

      expect(webSocket.bufferedAmount).to.equal(128);
    });

  });

  describe('binaryType', function() {

    it('set calls setter', function() {
      webSocket.binaryType = 'blob';

      expect(client.calls({op: 'set', id: webSocket._nativeObject.cid})[0].properties).to.eql({binaryType: 'blob'});
    });

    it('get calls getter', function() {
      stub(client, 'get').returns('blob');

      expect(webSocket.binaryType).to.equal('blob');
    });

  });

  describe('method send', function() {

    it('throws when readyState is CONNECTING', function() {
      expect(() => webSocket.send('hello'))
        .to.throw("Can not 'send' WebSocket message when WebSocket state is CONNECTING");
    });

    it('throws when data is not string, typedarray or arraybuffer', function() {
      tabris._notify(webSocket._nativeObject.cid, 'open', {});

      expect(() => webSocket.send(123))
        .to.throw("Data of type number is not supported in WebSocket 'send' operation");
    });

    it("calls 'send' with string data", function() {
      tabris._notify(webSocket._nativeObject.cid, 'open', {});

      webSocket.send('hello');

      expect(client.call).to.have.been.calledWith(webSocket._nativeObject.cid, 'send', {data: 'hello'});
    });

    it("calls 'send' with typedarray data", function() {
      tabris._notify(webSocket._nativeObject.cid, 'open', {});

      webSocket.send(new Int8Array([1, 2, 3]));

      expect(client.call).to.have.been
        .calledWith(webSocket._nativeObject.cid, 'send', {data: new Int8Array([1, 2, 3])});
    });

    it("calls 'send' with arraybuffer data", function() {
      tabris._notify(webSocket._nativeObject.cid, 'open', {});
      const data = new Int8Array([1, 2, 3]).buffer;

      webSocket.send(data);

      expect(client.call).to.have.been.calledWith(webSocket._nativeObject.cid, 'send', {data});
    });

  });

  describe('method close', function() {

    it('throws when code is not a number', function() {
      expect(() => webSocket.close('hello'))
        .to.throw('A given close code has to be either 1000 or in the range 3000 - 4999 inclusive');
    });

    it('throws when code is below 3000 and not 1000', function() {
      expect(() => webSocket.close(2999))
        .to.throw('A given close code has to be either 1000 or in the range 3000 - 4999 inclusive');
    });

    it('throws when code is larger than 4999', function() {
      expect(() => webSocket.close(5000))
        .to.throw('A given close code has to be either 1000 or in the range 3000 - 4999 inclusive');
    });

    it('throws when reason string has more than 123 utf-8 bytes', function() {
      expect(() => webSocket.close(1000,
        'Longer reason messages are not allowed to reduce data usage ' +
        'on bandwidth limited clients. Please use a shorter reason message.'))
        .to.throw('The close reason can not be larger than 123 utf-8 bytes');
    });

    it('sets readyState to CLOSING', function() {
      webSocket.close();

      expect(webSocket.readyState).to.equal(webSocket.CLOSING);
    });

    it("does not call 'close' when readyState is CLOSING", function() {
      webSocket.readyState = webSocket.CLOSING;

      webSocket.close();

      expect(client.call).to.have.not.been.called;
    });

    it("does not call 'close' when readyState is CLOSED", function() {
      webSocket.readyState = webSocket.CLOSED;

      webSocket.close();

      expect(client.call).to.have.not.been.called;
    });

    it("calls 'close' with code and reason", function() {
      webSocket.close(1000, 'message');

      expect(client.call).to.have.been
        .calledWith(webSocket._nativeObject.cid, 'close', {code: 1000, reason: 'message'});
    });
  });

});
