import {expect, mockTabris, spy, stub, restore} from '../../test';
import ClientStub from '../ClientStub';
import {fetch} from '../../../src/tabris/fetch/fetch';
import Response from '../../../src/tabris/fetch/Response';

describe('fetch', function() {

  let nativeObject, client, promise;

  beforeEach(function() {
    client = new ClientStub();
    mockTabris(client);
    let origCreate = tabris._nativeBridge.create;
    stub(tabris._nativeBridge, 'create').callsFake((cid, type) => {
      if (type === 'tabris.HttpRequest') {
        nativeObject = tabris._nativeObjectRegistry.find(cid);
        spy(nativeObject, 'send');
        spy(nativeObject, 'abort');
      }
      return origCreate.apply(tabris._nativeBridge, arguments);
    });
  });

  afterEach(function() {
    restore();
  });

  it('calls send on HttpRequest', function() {
    fetch('http://example.org');
    expect(nativeObject.send).to.have.been.calledWithMatch({
      url: 'http://example.org',
      method: 'GET',
      headers: {},
      data: null,
      responseType: 'arraybuffer',
      timeout: 0
    });
  });

  it('calls send on HttpRequest with config data', function() {
    fetch('http://example.org', {
      method: 'post',
      headers: {foo: 23, bar: 42},
      body: 'content',
      timeout: 4711
    });
    expect(nativeObject.send).to.have.been.calledWithMatch({
      url: 'http://example.org',
      method: 'POST',
      headers: {foo: '23', bar: '42'},
      data: 'content',
      responseType: 'arraybuffer',
      timeout: 4711
    });
  });

  describe('on finished', function() {

    beforeEach(function() {
      promise = fetch('http://example.org');
      nativeObject._trigger('stateChanged', {
        state: 'headers',
        code: 418,
        message: "I'm a teapot",
        headers: {'X-Foo': '23,42'}
      });
      nativeObject._trigger('stateChanged', {
        state: 'finished',
        response: "I can't brew coffee!"
      });
    });

    it('resolves promise with response', function() {
      return promise.then((response) => {
        expect(response).to.be.instanceOf(Response);
        expect(response.url).to.equal('http://example.org');
        expect(response.status).to.equal(418);
        expect(response.statusText).to.equal("I'm a teapot");
        expect(Array.from(response.headers)).to.deep.equal([['x-foo', '23,42']]);
      });
    });

    it('disposes remote object', function() {
      return promise.then(() => {
        expect(nativeObject.isDisposed()).to.be.true;
      });
    });

  });

  describe('on error', function() {

    beforeEach(function() {
      promise = fetch('http://example.org');
      nativeObject._trigger('stateChanged', {state: 'error'});
    });

    it('rejects promise with error', function() {
      return promise.then(expectFail, (err) => {
        expect(err).to.be.instanceOf(TypeError);
        expect(err.message).to.equal('Network request failed');
      });
    });

    it('disposes remote object', function() {
      return promise.then(expectFail, () => {
        expect(nativeObject.isDisposed()).to.be.true;
      });
    });

  });

  describe('on timeout', function() {

    beforeEach(function() {
      promise = fetch('http://example.org');
      nativeObject._trigger('stateChanged', {state: 'timeout'});
    });

    it('rejects promise with error', function() {
      return promise.then(expectFail, (err) => {
        expect(err).to.be.instanceOf(TypeError);
        expect(err.message).to.equal('Network request timed out');
      });
    });

    it('disposes remote object', function() {
      return promise.then(expectFail, () => {
        expect(nativeObject.isDisposed()).to.be.true;
      });
    });

  });

  describe('on abort', function() {

    beforeEach(function() {
      promise = fetch('http://example.org');
      nativeObject._trigger('stateChanged', {state: 'abort'});
    });

    it('rejects promise with error', function() {
      return promise.then(expectFail, (err) => {
        expect(err).to.be.instanceOf(TypeError);
        expect(err.message).to.equal('Network request aborted');
      });
    });

    it('disposes remote object', function() {
      return promise.then(expectFail, () => {
        expect(nativeObject.isDisposed()).to.be.true;
      });
    });

  });

});

function expectFail() {
  throw new Error('Expected to fail');
}
