import {expect, spy, stub, restore} from '../test';
import ClientStub from './ClientStub';
import ProxyStore from '../../src/tabris/ProxyStore';
import NativeBridge from '../../src/tabris/NativeBridge';
import WebSocket from '../../src/tabris/WebSocket';
import Event from '../../src/tabris/Event';

describe('WebSocket', function() {

  let webSocket;
  let client;

  beforeEach(function() {
    client = new ClientStub();
    global.tabris = {
      on: () => {},
      _proxies: new ProxyStore(),
      _notify: (cid, event, param) => tabris._proxies.find(cid)._trigger(event, param)
    };
    global.tabris._nativeBridge = new NativeBridge(client);
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
      tabris._notify(webSocket._proxy.cid, 'open', {});

      expect(webSocket.readyState).to.equal(webSocket.OPEN);
    });

    it('sets protocol to protocol parameter', function() {
      tabris._notify(webSocket._proxy.cid, 'open', {protocol: 'chat-protocol'});

      expect(webSocket.protocol).to.equal('chat-protocol');
    });

    it('sets extensions to extensions parameter', function() {
      tabris._notify(webSocket._proxy.cid, 'open', {extensions: 'compress'});

      expect(webSocket.extensions).to.equal('compress');
    });

    it('notifies onopen listener', function() {
      let listener = spy();
      webSocket.onopen = listener;

      tabris._notify(webSocket._proxy.cid, 'open', {protocol: 'chat-protocol', extensions: 'compress'});

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
      let listener = spy();
      webSocket.onmessage = listener;
      tabris._notify(webSocket._proxy.cid, 'open', {data: 'message'});

      tabris._notify(webSocket._proxy.cid, 'message', {data: 'message'});

      expect(listener).to.have.been.calledWithMatch({target: webSocket, data: 'message'});
      expect(listener.firstCall.args[0]).to.be.instanceOf(Event);
    });

  });

  describe('close event', function() {

    it('sets readyState to CLOSED', function() {
      tabris._notify(webSocket._proxy.cid, 'close', {});

      expect(webSocket.readyState).to.equal(webSocket.CLOSED);
    });

    it('notifies onclose listener', function() {
      let listener = spy();
      webSocket.onclose = listener;

      tabris._notify(webSocket._proxy.cid, 'close', {});

      expect(listener).to.have.been.calledWithMatch({target: webSocket});
      expect(listener.firstCall.args[0]).to.be.instanceOf(Event);
    });

  });

  describe('error event', function() {

    it('sets readyState to CLOSED', function() {
      tabris._notify(webSocket._proxy.cid, 'error', {});

      expect(webSocket.readyState).to.equal(webSocket.CLOSED);
    });

    it('notifies onerror listener', function() {
      let listener = spy();
      webSocket.onerror = listener;

      tabris._notify(webSocket._proxy.cid, 'error', {});

      expect(listener).to.have.been.calledWithMatch({target: webSocket});
      expect(listener.firstCall.args[0]).to.be.instanceOf(Event);
    });

  });

  describe('bufferProcess event', function() {

    it('reduces amount of buffered data', function() {
      webSocket.bufferedAmount = 1000;
      tabris._notify(webSocket._proxy.cid, 'bufferProcess', {byteLength: 100});

      expect(webSocket.bufferedAmount).to.equal(900);
    });

  });

  describe('binaryType', function() {

    it('set calls setter', function() {
      webSocket.binaryType = 'blob';

      expect(client.calls({op: 'set', id: webSocket._proxy.cid})[0].properties).to.eql({binaryType: 'blob'});
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
      tabris._notify(webSocket._proxy.cid, 'open', {});

      expect(() => webSocket.send(123))
        .to.throw("Data of type number is not supported in WebSocket 'send' operation");
    });

    it("calls 'send' with string data", function() {
      tabris._notify(webSocket._proxy.cid, 'open', {});

      webSocket.send('hello');

      expect(client.call).to.have.been.calledWith(webSocket._proxy.cid, 'send', {data: 'hello'});
    });

    it('increases bufferedAmount by the number of utf-8 bytes in string data', function() {
      tabris._notify(webSocket._proxy.cid, 'open', {});

      webSocket.send('hello ä');

      expect(webSocket.bufferedAmount).to.equal(8);
    });

    it("calls 'send' with typedarray data", function() {
      tabris._notify(webSocket._proxy.cid, 'open', {});

      webSocket.send(new Int8Array([1, 2, 3]));

      expect(client.call).to.have.been.calledWith(webSocket._proxy.cid, 'send', {data: new Int8Array([1, 2, 3])});
    });

    it("calls 'send' with arraybuffer data", function() {
      tabris._notify(webSocket._proxy.cid, 'open', {});
      let data = new Int8Array([1, 2, 3]).buffer;

      webSocket.send(data);

      expect(client.call).to.have.been.calledWith(webSocket._proxy.cid, 'send', {data});
    });

    it('increases bufferedAmount by the number of bytes in int8 array', function() {
      tabris._notify(webSocket._proxy.cid, 'open', {});

      webSocket.send(new Int8Array([1, 2, 3]));

      expect(webSocket.bufferedAmount).to.equal(3);
    });

    it('increases bufferedAmount by the number of bytes in arraybuffer', function() {
      tabris._notify(webSocket._proxy.cid, 'open', {});

      webSocket.send(new Int16Array([1, 2, 3]).buffer);

      expect(webSocket.bufferedAmount).to.equal(6);
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

      expect(client.call).to.have.not.been.called;
    });

    it("does not call 'close' when readyState is CLOSED", function() {
      webSocket.readyState = webSocket.OPEN;

      expect(client.call).to.have.not.been.called;
    });

    it("calls 'close' with code and reason", function() {
      webSocket.close(1000, 'message');

      expect(client.call).to.have.been.calledWith(webSocket._proxy.cid, 'close', {code: 1000, reason: 'message'});
    });
  });

});
