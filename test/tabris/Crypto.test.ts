import {expect, match, mockTabris, stub} from '../test';
import ClientMock from './ClientMock';
import Crypto, {TypedArray} from '../../src/tabris/Crypto';
import {SinonStub} from 'sinon';

describe('Crypto', function() {

  let client: ClientMock & {call: SinonStub};
  let crypto: Crypto;
  let returnValue: TypedArray;

  beforeEach(function() {
    client = new ClientMock() as any;
    mockTabris(client);
    crypto = new Crypto();
  });

  afterEach(function() {
    client = null;
    crypto = null;
  });

  describe('getRandomValues', function() {

    beforeEach(function() {
      stub(client, 'call').callsFake((id, method) => method === 'getRandomValues' ? returnValue : null);
    });

    it('fails with missing argument', function() {
      // @ts-ignore
      expect(() => crypto.getRandomValues())
        .to.throw('Not enough arguments to Crypto.getRandomValues');
    });

    it('fails with null argument', function() {
      expect(() => crypto.getRandomValues(null))
        .to.throw('Argument null is not an accepted array type');
    });

    it('fails with plain array', function() {
      // @ts-ignore
      expect(() => crypto.getRandomValues([0, 0, 0]))
        .to.throw('Argument [0, 0, 0] is not an accepted array type');
    });

    it('fails with float typed array', function() {
      // @ts-ignore
      expect(() => crypto.getRandomValues(new Float32Array(3)))
        .to.throw('Argument Float32Array is not an accepted array type');
    });

    it('fails when client returns wrong number of values', function() {
      returnValue = new Uint8Array([0, 1]);

      expect(() => crypto.getRandomValues(new Int8Array(3)))
        .to.throw('Not enough random bytes available');
    });

    it('fills a given Int8Array', function() {
      const buffer = new Int8Array(3);
      returnValue = new Uint8Array([0, 1, 255]);

      crypto.getRandomValues(buffer);

      expect(buffer[0]).to.equal(0);
      expect(buffer[1]).to.equal(1);
      expect(buffer[2]).to.equal(-1);
    });

    it('fills a given Uint8Array', function() {
      const buffer = new Uint8Array(3);
      returnValue = new Uint8Array([0, 1, 255]);

      crypto.getRandomValues(buffer);

      expect(buffer[0]).to.equal(0);
      expect(buffer[1]).to.equal(1);
      expect(buffer[2]).to.equal(255);
    });

    it('fills a given Uint8ClampedArray', function() {
      const buffer = new Uint8ClampedArray(3);
      returnValue = new Uint8Array([0, 1, 255]);

      crypto.getRandomValues(buffer);

      expect(buffer[0]).to.equal(0);
      expect(buffer[1]).to.equal(1);
      expect(buffer[2]).to.equal(255);
    });

    it('fills a given Int16Array', function() {
      const buffer = new Int16Array(3);
      returnValue = new Uint8Array([0, 0, 0, 1, 255, 255]);

      crypto.getRandomValues(buffer);

      expect(buffer.byteLength).to.equal(6);
      expect(buffer[0]).to.equal(0); // 0x0000
      expect(buffer[1]).to.equal(256); // 0x0100
      expect(buffer[2]).to.equal(-1); // 0xffff
    });

    it('fills a given Uint16Array', function() {
      const buffer = new Uint16Array(3);
      returnValue = new Uint8Array([0, 0, 0, 1, 255, 255]);

      crypto.getRandomValues(buffer);

      expect(buffer.byteLength).to.equal(6);
      expect(buffer[0]).to.equal(0); // 0x0000
      expect(buffer[1]).to.equal(256); // 0x0100
      expect(buffer[2]).to.equal(65535); // 0xffff
    });

    it('fills a given Int32Array', function() {
      const buffer = new Int32Array(3);
      returnValue = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 1, 255, 255, 255, 255]);

      crypto.getRandomValues(buffer);

      expect(buffer.byteLength).to.equal(12);
      expect(buffer[0]).to.equal(0);
      expect(buffer[1]).to.equal(0x01000000);
      expect(buffer[2]).to.equal(-1);
    });

    it('fills a given Uint32Array', function() {
      const buffer = new Uint32Array(3);
      returnValue = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 1, 255, 255, 255, 255]);

      crypto.getRandomValues(buffer);

      expect(buffer.byteLength).to.equal(12);
      expect(buffer[0]).to.equal(0);
      expect(buffer[1]).to.equal(0x01000000);
      expect(buffer[2]).to.equal(0xffffffff);
    });

    it('returns given array', function() {
      const buffer = new Uint32Array(3);
      returnValue = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 1, 255, 255, 255, 255]);

      expect(crypto.getRandomValues(buffer)).to.equal(buffer);
    });

  });

  describe('subtle.digest()', function() {

    let data: TypedArray | ArrayBuffer;
    let result: ArrayBuffer;

    beforeEach(function() {
      data = new ArrayBuffer(10);
      result = new ArrayBuffer(10);
      stub(client, 'call').callsFake((id, method, args) => args.onSuccess(result));
    });

    it('rejects if argument is missing', async () =>
      // @ts-ignore
      expect(crypto.subtle.digest('SHA-512'))
        .to.eventually.rejectedWith(TypeError, 'Not enough arguments to SubtleCrypto.digest')
    );

    it('rejects if algorithm is invalid type', async () =>
      expect(crypto.subtle.digest('SHA-511', data)).to.eventually.have.been
        .rejectedWith(TypeError, 'Algorithm: Unrecognized name SHA-511')
    );

    it('rejects if data is invalid type', async () =>
      expect(crypto.subtle.digest('SHA-512', [] as any))
        .to.eventually.rejectedWith(TypeError, 'Argument [] is not an accepted array type')
    );

    it('CALLs with arguments', async () => {
      await crypto.subtle.digest('SHA-512', data);
      expect(client.call).to.have.been.calledWithMatch(match.string, 'subtleDigest', {
        algorithm: 'SHA-512', data, onSuccess: match.func, onError: match.func
      });
    });

    it('unwraps typed array', async () => {
      const arr = new Uint16Array(data);
      await crypto.subtle.digest('SHA-512', arr);
      expect(client.call).to.have.been
        .calledWithMatch(match.string, 'subtleDigest', {data});
    });

    it('returns arraybuffer from call', async () => {
      expect(await crypto.subtle.digest('SHA-256', data)).to.equal(result);
    });

    it('rejects when client rejects', async () => {
      client.call.callsFake((id, method, args) => args.onError('foo'));
      return expect(crypto.subtle.digest('SHA-1', data)).to.eventually.have.been
        .rejectedWith(Error, 'foo');
    });

    it('rejects when non-arraybuffer is returned by client', async () => {
      client.call.callsFake((id, method, args) => args.onSuccess('foo'));
      return expect(crypto.subtle.digest('SHA-384', data)).to.eventually.have.been
        .rejectedWith(TypeError, 'Internal Type Error: result is not valid ArrayBuffer');
    });

  });

});
