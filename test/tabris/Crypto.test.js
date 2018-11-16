import {expect, mockTabris, stub} from '../test';
import ClientStub from './ClientStub';
import Crypto from '../../src/tabris/Crypto';

describe('Crypto', function() {

  let client;
  let crypto;
  let returnValue;

  beforeEach(function() {
    client = new ClientStub();
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
      expect(() => crypto.getRandomValues())
        .to.throw('Not enough arguments to Crypto.getRandomValues');
    });

    it('fails with null argument', function() {
      expect(() => crypto.getRandomValues(null))
        .to.throw('Unsupported type in Crypto.getRandomValues');
    });

    it('fails with plain array', function() {
      expect(() => crypto.getRandomValues([0, 0, 0]))
        .to.throw('Unsupported type in Crypto.getRandomValues');
    });

    it('fails with float typed array', function() {
      expect(() => crypto.getRandomValues(new Float32Array(3)))
        .to.throw('Unsupported type in Crypto.getRandomValues');
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

    it('fills a given Int16Arrray', function() {
      const buffer = new Int16Array(3);
      returnValue = new Uint8Array([0, 0, 0, 1, 255, 255]);

      crypto.getRandomValues(buffer);

      expect(buffer.byteLength).to.equal(6);
      expect(buffer[0]).to.equal(0); // 0x0000
      expect(buffer[1]).to.equal(256); // 0x0100
      expect(buffer[2]).to.equal(-1); // 0xffff
    });

    it('fills a given Uint16Arrray', function() {
      const buffer = new Uint16Array(3);
      returnValue = new Uint8Array([0, 0, 0, 1, 255, 255]);

      crypto.getRandomValues(buffer);

      expect(buffer.byteLength).to.equal(6);
      expect(buffer[0]).to.equal(0); // 0x0000
      expect(buffer[1]).to.equal(256); // 0x0100
      expect(buffer[2]).to.equal(65535); // 0xffff
    });

    it('fills a given Int32Arrray', function() {
      const buffer = new Int32Array(3);
      returnValue = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 1, 255, 255, 255, 255]);

      crypto.getRandomValues(buffer);

      expect(buffer.byteLength).to.equal(12);
      expect(buffer[0]).to.equal(0);
      expect(buffer[1]).to.equal(0x01000000);
      expect(buffer[2]).to.equal(-1);
    });

    it('fills a given Uint32Arrray', function() {
      const buffer = new Uint32Array(3);
      returnValue = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 1, 255, 255, 255, 255]);

      crypto.getRandomValues(buffer);

      expect(buffer.byteLength).to.equal(12);
      expect(buffer[0]).to.equal(0);
      expect(buffer[1]).to.equal(0x01000000);
      expect(buffer[2]).to.equal(0xffffffff);
    });

  });

});
