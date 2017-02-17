const tabris = require('../../build/tabris/');
const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sandbox = sinon.sandbox.create();
const restore = sandbox.restore.bind(sandbox);
const stub = sandbox.stub.bind(sandbox);
const sinonChai = require('sinon-chai');

chai.use(sinonChai);

describe('WebSocket', function() {

  let webSocket;
  let client;

  beforeEach(function() {
    client = stub({
      call: () => {},
      create: () => {},
      get: () => {},
      listen: () => {}
    });
    tabris._init(client);
    webSocket = new tabris.WebSocket('ws://url.com', 'chat-protocol');
  });

  afterEach(restore);

  it('calls send with string data', function() {
    tabris._notify(webSocket._proxy.cid, 'open', {});

    webSocket.send('hello');

    expect(client.call).to.have.been.calledWith(webSocket._proxy.cid, 'send', {data: 'hello'});
  });

});
