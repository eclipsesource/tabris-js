import {expect, mockTabris, restore} from '../test';
import ClientStub from './ClientStub';
import TextDecoder from '../../src/tabris/TextDecoder';

const decode = TextDecoder.decode;

describe('TextDecoder', function() {

  let client, buffer;

  beforeEach(function() {
    client = new ClientStub();
    mockTabris(client);
    buffer = new Uint8Array().buffer;
  });

  afterEach(restore);

  function created() {
    return client.calls({op: 'create', type: 'tabris.TextDecoder'})[0];
  }

  describe('decode', function() {

    it('creates native object tabris.TextDecoder', function() {
      decode(buffer);
      const createCalls = client.calls({op: 'create', type: 'tabris.TextDecoder'});
      expect(createCalls.length).to.equal(1);
      expect(createCalls[0].properties).to.deep.equal({});
    });

    it('adds native listeners on `result`', function() {
      decode(buffer);
      expect(client.calls({op: 'listen', id: created().id, event: 'result', listen: true}).length).to.equal(1);
      expect(client.calls({op: 'listen', id: created().id, event: 'error', listen: true}).length).to.equal(1);
    });

    it('rejects with missing buffer argument', function() {
      return decode().then(expectFail, err => {
        expect(err.message).to.equal('Invalid buffer type');
      });
    });

    it('rejects invalid buffer types', function() {
      return decode([]).then(expectFail, err => {
        expect(err.message).to.equal('Invalid buffer type');
      });
    });

    it('rejects unsupported encoding parameter', function() {
      return decode(buffer, 'foo').then(expectFail, err => {
        expect(err.message).to.equal("Unsupported encoding: 'foo'");
      });
    });

    it('does not create native object when rejecting parameters', function() {
      return decode().then(expectFail, () => {
        expect(client.calls()).to.be.empty;
      });
    });

    it('passes parameters to native call', function() {
      decode(buffer, 'ascii');
      const call = client.calls({op: 'call', method: 'decode'})[0];
      expect(call.parameters).to.deep.equal({data: buffer, encoding: 'ascii'});
    });

    it('defaults to utf-8', function() {
      decode(buffer);
      const call = client.calls({op: 'call', method: 'decode'})[0];
      expect(call.parameters.encoding).to.equal('utf-8');
    });

    it('replaces null with utf-8 ', function() {
      decode(buffer, null);
      const call = client.calls({op: 'call', method: 'decode'})[0];
      expect(call.parameters.encoding).to.equal('utf-8');
    });

    it('extracts ArrayBuffer from ArrayBufferView', function() {
      const bufferView = new Uint8Array();
      decode(bufferView);
      const call = client.calls({op: 'call', method: 'decode'})[0];
      expect(call.parameters.data).to.equal(bufferView.buffer);
    });

    it('resolves with result string', function() {
      const promise = decode(buffer);
      tabris._notify(created().id, 'result', {string: 'foo'});
      return promise.then(result => {
        expect(result).to.equal('foo');
      });
    });

    it('destroys remote object when result received', function() {
      const promise = decode(buffer);
      tabris._notify(created().id, 'result', {string: 'foo'});
      return promise.then(() => {
        expect(client.calls({op: 'destroy', id: created().id})).not.to.be.empty;
      });
    });

    it('rejects when error received', function() {
      const promise = decode(buffer);
      tabris._notify(created().id, 'error', {});
      return promise.then(expectFail, err => {
        expect(err.message).to.equal('Could not decode utf-8');
      });
    });

    it('destroys remote object when error received', function() {
      const promise = decode(buffer);
      tabris._notify(created().id, 'error', {});
      return promise.then(expectFail, () => {
        expect(client.calls({op: 'destroy', id: created().id})).not.to.be.empty;
      });
    });

  });

});

function expectFail() {
  throw new Error('Expected to fail');
}
