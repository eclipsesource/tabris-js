import {expect, mockTabris, stub} from '../test';
import ClientMock from './ClientMock';
import Crypto, {TypedArray} from '../../src/tabris/Crypto';

describe('Crypto', function() {

  let client: ClientMock & {call: Function};
  let crypto: Crypto;
  let returnValue: TypedArray;

  beforeEach(function() {
    client = new ClientMock() as any;
    mockTabris(client);
    crypto = new Crypto();
    stub(client, 'call').callsFake((id, method) => method === 'getRandomValues' ? returnValue : null);
  });

  afterEach(function() {
    client = null;
    crypto = null;
  });

  describe('getRandomValues', function() {

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

});
