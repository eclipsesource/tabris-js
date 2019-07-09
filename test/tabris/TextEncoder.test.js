import {expect, mockTabris, restore, stub} from '../test';
import ClientMock from './ClientMock';
import TextEncoder from '../../src/tabris/TextEncoder';

const encode = TextEncoder.encode;
const encodeSync = TextEncoder.encodeSync;

describe('TextEncoder', function() {

  /** @type {ClientMock} */
  let client;

  /** @type {string} */
  let text;

  beforeEach(function() {
    client = new ClientMock();
    mockTabris(client);
    text = 'Döner mit Soße';
  });

  afterEach(restore);

  function created() {
    return client.calls({op: 'create', type: 'tabris.TextEncoder'})[0];
  }

  describe('encode', function() {

    it('creates native object tabris.TextEncoder', function() {
      encode(text);
      const createCalls = client.calls({op: 'create', type: 'tabris.TextEncoder'});
      expect(createCalls.length).to.equal(1);
      expect(createCalls[0].properties).to.deep.equal({});
    });

    it('adds native listeners on `result`', function() {
      encode(text);
      expect(client.calls({op: 'listen', id: created().id, event: 'result', listen: true}).length).to.equal(1);
      expect(client.calls({op: 'listen', id: created().id, event: 'error', listen: true}).length).to.equal(1);
    });

    it('rejects with missing text argument', function() {
      return encode().then(expectFail, err => {
        expect(err.message).to.equal('Invalid text, must be a string');
      });
    });

    it('rejects invalid buffer types', function() {
      return encode([]).then(expectFail, err => {
        expect(err.message).to.equal('Invalid text, must be a string');
      });
    });

    it('rejects unsupported encoding parameter', function() {
      return encode(text, 'foo').then(expectFail, err => {
        expect(err.message).to.equal('Unsupported encoding: "foo"');
      });
    });

    it('does not create native object when rejecting parameters', function() {
      return encode().then(expectFail, () => {
        expect(client.calls()).to.be.empty;
      });
    });

    it('passes parameters to native call', function() {
      encode(text, 'ascii');
      const call = client.calls({op: 'call', method: 'encode'})[0];
      expect(call.parameters).to.deep.equal({text, encoding: 'ascii'});
    });

    it('defaults to utf-8', function() {
      encode(text);
      const call = client.calls({op: 'call', method: 'encode'})[0];
      expect(call.parameters.encoding).to.equal('utf-8');
    });

    it('replaces null with utf-8 ', function() {
      encode(text, null);
      const call = client.calls({op: 'call', method: 'encode'})[0];
      expect(call.parameters.encoding).to.equal('utf-8');
    });

    it('resolves with result ArrayBuffer', function() {
      const buffer = new Uint8Array([1, 2, 3]).buffer;
      const promise = encode(text);
      tabris._notify(created().id, 'result', {data: buffer});
      return promise.then(result => {
        expect(result).to.equal(buffer);
      });
    });

    it('destroys native object when result received', function() {
      const promise = encode(text);
      tabris._notify(created().id, 'result', {data: new Uint8Array([1, 2, 3]).buffer});
      return promise.then(() => {
        expect(client.calls({op: 'destroy', id: created().id})).not.to.be.empty;
      });
    });

    it('rejects when error received', function() {
      const promise = encode(text);
      tabris._notify(created().id, 'error', {});
      return promise.then(expectFail, err => {
        expect(err.message).to.equal('Could not encode utf-8');
      });
    });

    it('destroys native object when error received', function() {
      const promise = encode(text);
      tabris._notify(created().id, 'error', {});
      return promise.then(expectFail, () => {
        expect(client.calls({op: 'destroy', id: created().id})).not.to.be.empty;
      });
    });

  });
  describe('encodeSync', function() {

    /** @type {TextEncoder} */
    let encoder;

    beforeEach(function() {
      encoder = new TextEncoder();
      stub(TextEncoder, 'getInstance').returns(encoder);
      client.resetCalls();
    });

    it('adds no listeners', function() {
      encodeSync(text);
      expect(client.calls({op: 'listen', id: encoder.cid, listen: true}).length).to.equal(0);
    });

    it('throws for missing text argument', function() {
      expect(() => encodeSync()).to.throw(Error, 'Invalid text, must be a string');
    });

    it('throws invalid buffer types', function() {
      expect(() => encodeSync([])).to.throw(Error, 'Invalid text, must be a string');
    });

    it('throws for unsupported encoding parameter', function() {
      expect(() => encodeSync(text, 'foo')).to.throw(Error, 'Unsupported encoding: "foo"');
    });

    it('does not create new native object', function() {
      encodeSync(text, 'ascii');
      expect(client.calls({op: 'create'})).to.be.empty;
    });

    it('uses singleton object', function() {
      encodeSync(text, 'ascii');
      expect(client.calls({op: 'call', method: 'encodeSync', id: encoder.cid}).length).to.equal(1);
    });

    it('passes parameters to native call', function() {
      encodeSync(text, 'ascii');
      const call = client.calls({op: 'call', method: 'encodeSync', id: encoder.cid})[0];
      expect(call.parameters).to.deep.equal({text, encoding: 'ascii'});
    });

    it('defaults to utf-8', function() {
      encodeSync(text);
      const call = client.calls({op: 'call', method: 'encodeSync', id: encoder.cid})[0];
      expect(call.parameters.encoding).to.equal('utf-8');
    });

    it('replaces null with utf-8 ', function() {
      encodeSync(text, null);
      const call = client.calls({op: 'call', method: 'encodeSync', id: encoder.cid})[0];
      expect(call.parameters.encoding).to.equal('utf-8');
    });

    it('returns ArrayBuffer', function() {
      const buffer = new Uint8Array([1, 2, 3]).buffer;
      // @ts-ignore
      stub(client, 'call').callsFake((id, method) => {
        if (method === 'encodeSync') {
          return buffer;
        }
      });
      expect(encodeSync(text)).to.equal(buffer);
    });

    it('does not destroy native object after call', function() {
      encodeSync(text);
      expect(client.calls({op: 'destroy', id: encoder.cid})).to.be.empty;
    });

  });

});

function expectFail() {
  throw new Error('Expected to fail');
}
