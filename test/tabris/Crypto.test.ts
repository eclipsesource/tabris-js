import {expect, match, mockTabris, stub} from '../test';
import ClientMock from './ClientMock';
import Crypto, {TypedArray} from '../../src/tabris/Crypto';
import {SinonStub} from 'sinon';
import CryptoKey, {_CryptoKey} from '../../src/tabris/CryptoKey';
import {getBuffer, getCid} from '../../src/tabris/util';

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

  describe('subtle.deriveKey()', function() {

    let publicKey: CryptoKey;
    let baseKey: CryptoKey;
    let params: Parameters<typeof crypto.subtle.deriveKey>;

    async function deriveKey(cb?: (nativeParams: any) => void) {
      const promise = crypto.subtle.deriveKey.apply(crypto.subtle, params);
      cb?.call(null, client.calls({op: 'call', method: 'derive'})[0].parameters);
      return promise as Promise<CryptoKey>;
    }

    beforeEach(function() {
      publicKey = new CryptoKey(new _CryptoKey(), {});
      baseKey = new CryptoKey(new _CryptoKey(), {});
      client.resetCalls();
      params = [
        {
          name: 'ECDH',
          namedCurve: 'P-256',
          public: publicKey
        },
        baseKey,
        {
          name: 'AES-GCM',
          length: 123
        },
        true,
        ['foo', 'bar']
      ];
    });

    it('CREATEs native CryptoKey', async function() {
      await deriveKey(param => param.onSuccess());
      expect(client.calls({op: 'create', type: 'tabris.CryptoKey'}).length).to.equal(1);
    });

    it('CALLs derive with ECDH algorithm', async function() {
      await deriveKey(param => param.onSuccess());

      const id = client.calls({op: 'create', type: 'tabris.CryptoKey'})[0].id;
      const deriveCall = client.calls({op: 'call', method: 'derive', id})[0];
      expect(deriveCall.parameters).to.deep.include({
        algorithm: {
          name: 'ECDH',
          namedCurve: 'P-256',
          public: getCid(publicKey)
        },
        baseKey: getCid(baseKey),
        derivedKeyAlgorithm: {
          name: 'AES-GCM',
          length: 123
        },
        extractable: true,
        keyUsages: ['foo', 'bar']
      });
    });

    it('CALLs derive with HKDF algorithm', async function() {
      params[0] = {
        name: 'HKDF',
        hash: 'SHA-256',
        info: new Uint8Array([1, 2, 3]),
        salt: new ArrayBuffer(11)
      };

      await deriveKey(param => param.onSuccess());

      const id = client.calls({op: 'create', type: 'tabris.CryptoKey'})[0].id;
      const deriveCall = client.calls({op: 'call', method: 'derive', id})[0];
      expect(deriveCall.parameters).to.deep.include({
        algorithm: {
          name: 'HKDF',
          hash: 'SHA-256',
          info: getBuffer(params[0].info),
          salt: params[0].salt
        },
        baseKey: getCid(baseKey),
        derivedKeyAlgorithm: {
          name: 'AES-GCM',
          length: 123
        },
        extractable: true,
        keyUsages: ['foo', 'bar']
      });
    });

    it('returns CryptoKey', async function() {
      const key = await deriveKey(param => param.onSuccess());
      const id = client.calls({op: 'create', type: 'tabris.CryptoKey'})[0].id;
      expect(key).to.be.instanceOf(CryptoKey);
      expect(getCid(key)).to.equal(id);
      expect(key.algorithm).to.deep.equal({
        name: 'ECDH',
        namedCurve: 'P-256',
        public: publicKey
      });
      expect(key.extractable).to.be.true;
      expect(key.type).to.equal('secret');
      expect(key.usages).to.deep.equal(['foo', 'bar']);
    });

    it('propagates rejection and disposes CryptoKey', async function() {
      await expect(deriveKey(param => param.onError('fooerror')))
        .rejectedWith(Error, 'fooerror');
      const {id} = client.calls({op: 'create', type: 'tabris.CryptoKey'})[0];
      expect(client.calls({op: 'destroy', id}));
    });

    it('checks parameter length', async function() {
      params.pop();
      await expect(deriveKey())
        .rejectedWith(TypeError, 'Expected at least 5 arguments, got 4');
      expect(client.calls({op: 'create', type: 'tabris.CryptoKey'}).length).to.equal(0);
    });

    it('checks algorithm keys', async function() {
      (params[2] as any).foo = 'bar';
      await expect(deriveKey())
        .rejectedWith(TypeError, /contains unexpected entry "foo"/);
      expect(client.calls({op: 'create', type: 'tabris.CryptoKey'}).length).to.equal(0);
    });

    it('checks derivedKeyAlgorithm keys', async function() {
      (params[0] as any).foo = 'bar';
      await expect(deriveKey())
        .rejectedWith(TypeError, /contains unexpected entry "foo"/);
      expect(client.calls({op: 'create', type: 'tabris.CryptoKey'}).length).to.equal(0);
    });

    it('checks baseKey', async function() {
      params[1] = null;
      await expect(deriveKey())
        .rejectedWith(TypeError, 'Expected baseKey to be of type CryptoKey, got null');
      expect(client.calls({op: 'create', type: 'tabris.CryptoKey'}).length).to.equal(0);
    });

    it('checks usages', async function() {
      params[4] = null;
      await expect(deriveKey())
        .rejectedWith(TypeError, 'Expected keyUsages to be an array, got null');
      expect(client.calls({op: 'create', type: 'tabris.CryptoKey'}).length).to.equal(0);
    });

    it('checks extractable', async function() {
      params[3] = null;
      await expect(deriveKey())
        .rejectedWith(TypeError, 'Expected extractable to be a boolean, got null');
      expect(client.calls({op: 'create', type: 'tabris.CryptoKey'}).length).to.equal(0);
    });

    it('checks algorithm.name', async function() {
      (params[0] as any).name = 'foo';
      await expect(deriveKey())
        .rejectedWith(TypeError, 'algorithm.name must be "ECDH" or "HKDF", got "foo"');
      expect(client.calls({op: 'create', type: 'tabris.CryptoKey'}).length).to.equal(0);
    });

    it('checks algorithm.namedCurve', async function() {
      (params[0] as any).namedCurve = 'foo';
      await expect(deriveKey())
        .rejectedWith(TypeError, 'algorithm.namedCurve must be "P-256", got "foo"');
      expect(client.calls({op: 'create', type: 'tabris.CryptoKey'}).length).to.equal(0);
    });

    it('checks algorithm.public', async function() {
      (params[0] as any).public = null;
      await expect(deriveKey())
        .rejectedWith(TypeError, 'Expected algorithm.public to be of type CryptoKey, got null');
      expect(client.calls({op: 'create', type: 'tabris.CryptoKey'}).length).to.equal(0);
    });

    it('checks derivedKeyAlgorithm.name', async function() {
      params[2].name = 'foo';
      await expect(deriveKey())
        .rejectedWith(TypeError, 'derivedKeyAlgorithm.name must be "AES-GCM", got "foo"');
      expect(client.calls({op: 'create', type: 'tabris.CryptoKey'}).length).to.equal(0);
    });

    it('checks derivedKeyAlgorithm.length', async function() {
      (params[2] as any).length = 'foo';
      await expect(deriveKey())
        .rejectedWith(TypeError, 'Expected derivedKeyAlgorithm.length to be a number, got string.');
      expect(client.calls({op: 'create', type: 'tabris.CryptoKey'}).length).to.equal(0);
    });

    it('checks options.authPromptTitle', async function() {
      params[5] = {authPromptTitle: null};
      await expect(deriveKey())
        .rejectedWith(TypeError, 'Expected options.authPromptTitle to be a string, got null.');
      expect(client.calls({op: 'call', method: 'subtleSign'}).length).to.equal(0);
    });

    it('checks options.authPromptMessage', async function() {
      params[5] = {authPromptMessage: null};
      await expect(deriveKey())
        .rejectedWith(TypeError, 'Expected options.authPromptMessage to be a string, got null.');
      expect(client.calls({op: 'call', method: 'subtleSign'}).length).to.equal(0);
    });

  });

  describe('subtle.deriveBits()', function() {

    let publicKey: CryptoKey;
    let baseKey: CryptoKey;
    let params: Parameters<typeof crypto.subtle.deriveBits>;
    let result: ArrayBuffer;
    let native: (id: string, method: string, args: any) => void;

    async function deriveBits() {
      return crypto.subtle.deriveBits.apply(crypto.subtle, params);
    }

    beforeEach(function() {
      publicKey = new CryptoKey(new _CryptoKey(), {});
      baseKey = new CryptoKey(new _CryptoKey(), {});
      client.resetCalls();
      const orgCall = client.call;
      stub(client, 'call').callsFake(function() {
        native.apply(null, arguments);
        orgCall.apply(client, arguments);
      });
      native = (_id, method, args) => {
        if (method === 'derive') {
          args.onSuccess();
        } else if (method === 'subtleExportKey') {
          args.onSuccess(result);
        }
      };
      result = new ArrayBuffer(10);
      params = [
        {
          name: 'ECDH',
          namedCurve: 'P-256',
          public: publicKey
        },
        baseKey,
        123
      ];
    });

    it('CREATEs native CryptoKey', async function() {
      await deriveBits();
      expect(client.calls({op: 'create', type: 'tabris.CryptoKey'}).length).to.equal(1);
    });

    it('CALLs derive with ECDH algorithm', async function() {
      await deriveBits();

      const id = client.calls({op: 'create', type: 'tabris.CryptoKey'})[0].id;
      const deriveCall = client.calls({op: 'call', method: 'derive', id})[0];
      expect(deriveCall.parameters).to.deep.include({
        algorithm: {
          name: 'ECDH',
          namedCurve: 'P-256',
          public: getCid(publicKey)
        },
        baseKey: getCid(baseKey),
        derivedKeyAlgorithm: {
          name: 'AES-GCM',
          length: 123
        },
        extractable: true,
        keyUsages: []
      });
    });

    it('CALLs subtleExportKey with raw format', async function() {
      await deriveBits();

      const id = client.calls({op: 'create', type: 'tabris.CryptoKey'})[0].id;
      const exportCall = client.calls({op: 'call', method: 'subtleExportKey'})[0];
      expect(exportCall.parameters).to.deep.include({
        format: 'raw',
        key: id
      });
    });

    it('returns ArrayBuffer', async function() {
      expect(await deriveBits()).to.equal(result);
    });

    it('propagates derive rejection and disposes CryptoKey', async function() {
      native = (_id, method, args) => {
        if (method === 'derive') {
          args.onError('fooerror');
        }
      };
      await expect(deriveBits()).rejectedWith(Error, 'fooerror');
      const {id} = client.calls({op: 'create', type: 'tabris.CryptoKey'})[0];
      expect(client.calls({op: 'destroy', id}));
    });

    it('propagates subtleExportKey rejection and disposes CryptoKey', async function() {
      native = (_id, method, args) => {
        if (method === 'derive') {
          args.onSuccess();
        } else if (method === 'subtleExportKey') {
          args.onError('fooerror');
        }
      };
      await expect(deriveBits()).rejectedWith(Error, 'fooerror');
      const {id} = client.calls({op: 'create', type: 'tabris.CryptoKey'})[0];
      expect(client.calls({op: 'destroy', id}));
    });

    it('checks parameter length', async function() {
      params.pop();
      await expect(deriveBits()).rejectedWith(TypeError, 'Expected at least 3 arguments, got 2');
      expect(client.calls({op: 'create', type: 'tabris.CryptoKey'}).length).to.equal(0);
    });

    it('checks length parameter', async function() {
      params[2] = NaN;
      await expect(deriveBits()).rejectedWith(TypeError, 'Expected length to be a valid number, got NaN');
      expect(client.calls({op: 'create', type: 'tabris.CryptoKey'}).length).to.equal(0);
    });

    it('checks algorithm keys', async function() {
      (params[0] as any).foo = 'bar';
      await expect(deriveBits())
        .rejectedWith(TypeError, /contains unexpected entry "foo"/);
      expect(client.calls({op: 'create', type: 'tabris.CryptoKey'}).length).to.equal(0);
    });

    it('checks baseKey', async function() {
      params[1] = null;
      await expect(deriveBits())
        .rejectedWith(TypeError, 'Expected baseKey to be of type CryptoKey, got null.');
      expect(client.calls({op: 'create', type: 'tabris.CryptoKey'}).length).to.equal(0);
    });

    it('checks options.authPromptTitle', async function() {
      params[3] = {authPromptTitle: null};
      await expect(deriveBits())
        .rejectedWith(TypeError, 'Expected options.authPromptTitle to be a string, got null.');
      expect(client.calls({op: 'call', method: 'subtleSign'}).length).to.equal(0);
    });

    it('checks options.authPromptMessage', async function() {
      params[3] = {authPromptMessage: null};
      await expect(deriveBits())
        .rejectedWith(TypeError, 'Expected options.authPromptMessage to be a string, got null.');
      expect(client.calls({op: 'call', method: 'subtleSign'}).length).to.equal(0);
    });

  });

  describe('subtle.importKey()', function() {

    let keyData: ArrayBuffer;
    let params: Parameters<typeof crypto.subtle.importKey>;

    async function importKey(cb?: (nativeParams: any) => void) {
      const promise = crypto.subtle.importKey.apply(crypto.subtle, params);
      cb?.call(null, client.calls({op: 'call', method: 'import'})[0].parameters);
      return promise;
    }

    beforeEach(function() {
      keyData = new ArrayBuffer(10);
      client.resetCalls();
      params = [
        'spki',
        keyData,
        {
          name: 'ECDH',
          namedCurve: 'P-256'
        },
        true,
        ['foo', 'bar']
      ];
    });

    it('CREATEs native CryptoKey', async function() {
      await importKey(param => param.onSuccess());
      expect(client.calls({op: 'create', type: 'tabris.CryptoKey'}).length).to.equal(1);
    });

    it('CALLs import', async function() {
      await importKey(param => param.onSuccess());

      const id = client.calls({op: 'create', type: 'tabris.CryptoKey'})[0].id;
      const importCall = client.calls({op: 'call', method: 'import', id})[0];
      expect(importCall.parameters).to.deep.include({
        format: 'spki',
        keyData,
        algorithm: {
          name: 'ECDH',
          namedCurve: 'P-256'
        },
        extractable: true,
        keyUsages: ['foo', 'bar']
      });
    });

    it('unwraps array buffer', async function() {
      params[1] = new Uint8Array(keyData);
      await importKey(param => param.onSuccess());

      const id = client.calls({op: 'create', type: 'tabris.CryptoKey'})[0].id;
      const importCall = client.calls({op: 'call', method: 'import', id})[0];
      expect(importCall.parameters.keyData).to.equal(keyData);
    });

    it('turns AES-GCM object in to string', async function() {
      params[2] = {name: 'AES-GCM'};
      await importKey(param => param.onSuccess());

      const id = client.calls({op: 'create', type: 'tabris.CryptoKey'})[0].id;
      const importCall = client.calls({op: 'call', method: 'import', id})[0];
      expect(importCall.parameters.algorithm).to.equal('AES-GCM');
    });

    it('passes through AES-GCM string', async function() {
      params[2] = 'AES-GCM';
      await importKey(param => param.onSuccess());

      const id = client.calls({op: 'create', type: 'tabris.CryptoKey'})[0].id;
      const importCall = client.calls({op: 'call', method: 'import', id})[0];
      expect(importCall.parameters.algorithm).to.equal('AES-GCM');
    });

    it('returns CryptoKey', async function() {
      const key = await importKey(param => param.onSuccess());
      const id = client.calls({op: 'create', type: 'tabris.CryptoKey'})[0].id;
      expect(key).to.be.instanceOf(CryptoKey);
      expect(getCid(key)).to.equal(id);
      expect(key.algorithm).to.deep.equal({
        name: 'ECDH',
        namedCurve: 'P-256'
      });
      expect(key.extractable).to.be.true;
      expect(key.usages).to.deep.equal(['foo', 'bar']);
    });

    it('propagates rejection and disposes CryptoKey', async function() {
      await expect(importKey(param => param.onError('fooerror')))
        .rejectedWith(Error, 'fooerror');
      const {id} = client.calls({op: 'create', type: 'tabris.CryptoKey'})[0];
      expect(client.calls({op: 'destroy', id}));
    });

    it('checks parameter length', async function() {
      params.pop();
      await expect(importKey())
        .rejectedWith(TypeError, 'Expected 5 arguments, got 4');
      expect(client.calls({op: 'create', type: 'tabris.CryptoKey'}).length).to.equal(0);
    });

    it('checks format values', async function() {
      params[0] = 'foo';
      await expect(importKey())
        .rejectedWith(TypeError, 'format must be "spki", "pkcs8" or "raw", got "foo"');
      expect(client.calls({op: 'create', type: 'tabris.CryptoKey'}).length).to.equal(0);
    });

    it('checks keyData', async function() {
      params[1] = null;
      await expect(importKey())
        .rejectedWith(TypeError, 'Expected keyData to be of type ArrayBuffer, got null');
      expect(client.calls({op: 'create', type: 'tabris.CryptoKey'}).length).to.equal(0);
    });

    it('checks algorithm.name', async function() {
      (params[2] as any).name = 'foo';
      await expect(importKey())
        .rejectedWith(TypeError, 'algorithm.name must be "ECDH", "ECDSA" or "AES-GCM", got "foo"');
      expect(client.calls({op: 'create', type: 'tabris.CryptoKey'}).length).to.equal(0);
    });

    it('checks algorithm.namedCurve', async function() {
      (params[2] as any).namedCurve = 'foo';
      await expect(importKey())
        .rejectedWith(TypeError, 'algorithm.namedCurve must be "P-256", got "foo"');
      expect(client.calls({op: 'create', type: 'tabris.CryptoKey'}).length).to.equal(0);
    });

    it('checks algorithm keys for ECDH', async function() {
      (params[2] as any).foo = 'foo';
      await expect(importKey())
        .rejectedWith(TypeError, 'Object contains unexpected entry "foo"');
      expect(client.calls({op: 'create', type: 'tabris.CryptoKey'}).length).to.equal(0);
    });

    it('checks algorithm keys for ECDSA', async function() {
      (params[2] as any).name = 'ECDSA';
      (params[2] as any).foo = 'foo';
      await expect(importKey())
        .rejectedWith(TypeError, 'Object contains unexpected entry "foo"');
      expect(client.calls({op: 'create', type: 'tabris.CryptoKey'}).length).to.equal(0);
    });

    it('checks algorithm keys for AES-GCM', async function() {
      (params[2] as any) = {name: 'AES-GCM', namedCurve: 'P-256'};
      await expect(importKey())
        .rejectedWith(TypeError, /contains unexpected entry "namedCurve"/);
      expect(client.calls({op: 'create', type: 'tabris.CryptoKey'}).length).to.equal(0);
    });

    it('checks extractable', async function() {
      params[3] = null;
      await expect(importKey())
        .rejectedWith(TypeError, 'Expected extractable to be a boolean, got null');
      expect(client.calls({op: 'create', type: 'tabris.CryptoKey'}).length).to.equal(0);
    });

    it('checks key usages', async function() {
      params[4] = null;
      await expect(importKey())
        .rejectedWith(TypeError, 'Expected keyUsages to be an array, got null');
      expect(client.calls({op: 'create', type: 'tabris.CryptoKey'}).length).to.equal(0);
    });

  });

  describe('subtle.exportKey()', function() {

    let params: Parameters<typeof crypto.subtle.exportKey>;
    let key: _CryptoKey;

    async function exportKey(cb?: (nativeParams: any) => void) {
      const promise = crypto.subtle.exportKey.apply(crypto.subtle, params);
      const exportCall = client.calls({op: 'call', method: 'subtleExportKey'})[0];
      cb?.call(null, exportCall?.parameters);
      return promise;
    }

    beforeEach(function() {
      client.resetCalls();
      key = new _CryptoKey();
      params = [
        'spki',
        new CryptoKey(key, {})
      ];
    });

    it('CALLs exportKey', async function() {
      await exportKey(param => param.onSuccess());

      const exportCalls = client.calls({op: 'call', method: 'subtleExportKey'});
      expect(exportCalls.length).to.equal(1);
      expect(exportCalls[0].parameters).to.deep.include({
        format: 'spki',
        key: key.cid
      });
    });

    it('returns data', async function() {
      const data = new ArrayBuffer(3);
      expect(await exportKey(param => param.onSuccess(data)))
        .to.equal(data);
    });

    it('propagates rejection', async function() {
      await expect(exportKey(param => param.onError('fooerror')))
        .rejectedWith(Error, 'fooerror');
    });

    it('checks parameter length', async function() {
      params.pop();
      await expect(exportKey())
        .rejectedWith(TypeError, 'Expected 2 arguments, got 1');
      expect(client.calls({op: 'call', method: 'subtleExportKey'}).length).to.equal(0);
    });

    it('checks format values', async function() {
      // @ts-ignore
      params[0] = 'foo';
      await expect(exportKey())
        .rejectedWith(TypeError, 'format must be "raw" or "spki", got "foo"');
      expect(client.calls({op: 'call', method: 'subtleExportKey'}).length).to.equal(0);
    });

    it('checks key', async function() {
      params[1] = null;
      await expect(exportKey())
        .rejectedWith(TypeError, 'Expected key to be of type CryptoKey, got null');
      expect(client.calls({op: 'call', method: 'subtleExportKey'}).length).to.equal(0);
    });

  });

  describe('subtle.encrypt()', function() {

    let params: Parameters<typeof crypto.subtle.encrypt>;
    let iv: ArrayBuffer;
    let data: ArrayBuffer;
    let key: _CryptoKey;

    async function encrypt(cb?: (nativeParams: any) => void) {
      const promise = crypto.subtle.encrypt.apply(crypto.subtle, params);
      cb?.call(null, client.calls({op: 'call', method: 'subtleEncrypt'})[0].parameters);
      return promise;
    }

    beforeEach(function() {
      iv = new ArrayBuffer(1);
      data = new ArrayBuffer(10);
      key = new _CryptoKey();
      client.resetCalls();
      params = [
        {
          name: 'AES-GCM',
          iv,
          tagLength: 23
        },
        new CryptoKey(key, {}),
        data
      ];
    });

    it('CALLs subtleEncrypt', async function() {
      await encrypt(param => param.onSuccess());

      const encryptCalls = client.calls({op: 'call', method: 'subtleEncrypt'});
      expect(encryptCalls.length).to.equal(1);
      expect(encryptCalls[0].parameters).to.deep.include({
        algorithm: {
          name: 'AES-GCM',
          iv,
          tagLength: 23
        },
        key: key.cid,
        data
      });
    });

    it('Unwraps array buffer', async function() {
      params[0].iv = new Uint8Array(params[0].iv);
      params[2] = new Uint8Array(params[2]);
      await encrypt(param => param.onSuccess());

      const encryptCalls = client.calls({op: 'call', method: 'subtleEncrypt'});
      expect(encryptCalls.length).to.equal(1);
      expect(encryptCalls[0].parameters).to.deep.include({
        algorithm: {
          name: 'AES-GCM',
          iv,
          tagLength: 23
        },
        data
      });
    });

    it('returns encrypted data', async function() {
      const encrypted = new ArrayBuffer(2);
      expect(await encrypt(param => param.onSuccess(encrypted)))
        .to.equal(encrypted);
    });

    it('propagates rejection', async function() {
      await expect(encrypt(param => param.onError('fooerror')))
        .rejectedWith(Error, 'fooerror');
    });

    it('checks parameter length', async function() {
      params.pop();
      await expect(encrypt())
        .rejectedWith(TypeError, 'Expected 3 arguments, got 2');
      expect(client.calls({op: 'call', method: 'subtleEncrypt'}).length).to.equal(0);
    });

    it('checks algorithm.name', async function() {
      params[0].name = 'foo';
      await expect(encrypt())
        .rejectedWith(TypeError, 'algorithm.name must be "AES-GCM", got "foo"');
      expect(client.calls({op: 'call', method: 'subtleEncrypt'}).length).to.equal(0);
    });

    it('checks algorithm.iv', async function() {
      params[0].iv = null;
      await expect(encrypt())
        .rejectedWith(TypeError, 'Expected algorithm.iv to be of type ArrayBuffer, got null');
      expect(client.calls({op: 'call', method: 'subtleEncrypt'}).length).to.equal(0);
    });

    it('checks algorithm.tagLength', async function() {
      params[0].tagLength = 'foo' as any;
      await expect(encrypt())
        .rejectedWith(TypeError, 'Expected algorithm.tagLength to be a number, got string.');
      expect(client.calls({op: 'call', method: 'subtleEncrypt'}).length).to.equal(0);
    });

    it('allows algorithm.tagLength undefined', async function() {
      delete params[0].tagLength;
      await encrypt(param => param.onSuccess());
      expect(client.calls({op: 'call', method: 'subtleEncrypt'})[0].parameters).to.deep.include({
        algorithm: {
          name: 'AES-GCM',
          iv,
          tagLength: 128
        }
      });
    });

    it('checks key', async function() {
      params[1] = null;
      await expect(encrypt())
        .rejectedWith(TypeError, 'Expected key to be of type CryptoKey, got null');
      expect(client.calls({op: 'call', method: 'subtleEncrypt'}).length).to.equal(0);
    });

    it('checks data', async function() {
      params[2] = null;
      await expect(encrypt())
        .rejectedWith(TypeError, 'Expected data to be of type ArrayBuffer, got null');
      expect(client.calls({op: 'call', method: 'subtleEncrypt'}).length).to.equal(0);
    });

  });

  describe('subtle.decrypt()', function() {

    let params: Parameters<typeof crypto.subtle.decrypt>;
    let iv: ArrayBuffer;
    let data: ArrayBuffer;
    let key: _CryptoKey;

    async function decrypt(cb?: (nativeParams: any) => void) {
      const promise = crypto.subtle.decrypt.apply(crypto.subtle, params);
      cb?.call(null, client.calls({op: 'call', method: 'subtleDecrypt'})[0].parameters);
      return promise;
    }

    beforeEach(function() {
      client.resetCalls();
      iv = new ArrayBuffer(1);
      data = new ArrayBuffer(10);
      key = new _CryptoKey();
      params = [
        {
          name: 'AES-GCM',
          iv,
          tagLength: 23
        },
        new CryptoKey(key, {}),
        data
      ];
    });

    it('CALLs subtleDecrypt', async function() {
      await decrypt(param => param.onSuccess());
      const decryptCalls = client.calls({op: 'call', method: 'subtleDecrypt'});
      expect(decryptCalls.length).to.equal(1);
      expect(decryptCalls[0].parameters).to.deep.include({
        algorithm: {
          name: 'AES-GCM',
          iv,
          tagLength: 23
        },
        key: key.cid,
        data
      });
    });

    it('unwraps array buffer', async function() {
      params[0].iv = new Uint8Array(params[0].iv);
      params[2] = new Uint8Array(params[2]);

      await decrypt(param => param.onSuccess());

      const decryptCalls = client.calls({op: 'call', method: 'subtleDecrypt'});
      expect(decryptCalls[0].parameters).to.deep.include({
        algorithm: {
          name: 'AES-GCM',
          iv,
          tagLength: 23
        },
        data
      });

    });

    it('returns decrypted data', async function() {
      const decrypted = new ArrayBuffer(2);
      expect(await decrypt(param => param.onSuccess(decrypted)))
        .to.equal(decrypted);
    });

    it('propagates rejection', async function() {
      await expect(decrypt(param => param.onError('fooerror')))
        .rejectedWith(Error, 'fooerror');
    });

    it('checks parameter length', async function() {
      params.pop();
      await expect(decrypt())
        .rejectedWith(TypeError, 'Expected 3 arguments, got 2');
      expect(client.calls({op: 'call', method: 'subtleDecrypt'}).length).to.equal(0);
    });

    it('checks algorithm.name', async function() {
      params[0].name = 'foo';
      await expect(decrypt())
        .rejectedWith(TypeError, 'algorithm.name must be "AES-GCM", got "foo"');
      expect(client.calls({op: 'call', method: 'subtleDecrypt'}).length).to.equal(0);
    });

    it('checks algorithm.iv', async function() {
      params[0].iv = null;
      await expect(decrypt())
        .rejectedWith(TypeError, 'Expected algorithm.iv to be of type ArrayBuffer, got null.');
      expect(client.calls({op: 'call', method: 'subtleDecrypt'}).length).to.equal(0);
    });

    it('checks algorithm.tagLength', async function() {
      params[0].tagLength = 'foo' as any;
      await expect(decrypt())
        .rejectedWith(TypeError, 'Expected algorithm.tagLength to be a number, got string.');
      expect(client.calls({op: 'call', method: 'subtleDecrypt'}).length).to.equal(0);
    });

    it('allows algorithm.tagLength undefined', async function() {
      delete params[0].tagLength;
      await decrypt(param => param.onSuccess());
      expect(client.calls({op: 'call', method: 'subtleDecrypt'})[0].parameters).to.deep.include({
        algorithm: {
          name: 'AES-GCM',
          iv,
          tagLength: 128
        }
      });
    });

    it('checks key', async function() {
      params[1] = null;
      await expect(decrypt())
        .rejectedWith(TypeError, 'Expected key to be of type CryptoKey, got null');
      expect(client.calls({op: 'call', method: 'subtleDecrypt'}).length).to.equal(0);
    });

    it('checks data', async function() {
      params[2] = null;
      await expect(decrypt())
        .rejectedWith(TypeError, 'Expected data to be of type ArrayBuffer, got null');
      expect(client.calls({op: 'call', method: 'subtleDecrypt'}).length).to.equal(0);
    });

  });

  describe('subtle.generateKey()', function() {

    let params: Parameters<typeof crypto.subtle.generateKey>;

    async function generateKey(cb?: (nativeParams: any) => void) {
      const promise = crypto.subtle.generateKey.apply(crypto.subtle, params);
      cb?.call(null, client.calls({op: 'call', method: 'generate'})[0].parameters);
      return promise;
    }

    beforeEach(function() {
      client.resetCalls();
      params = [
        {name: 'ECDSA', namedCurve: 'P-256'},
        true,
        ['foo', 'bar'],
        {usageRequiresAuth: false}
      ];
    });

    it('CREATEs CryptKey and CALLs generate', async function() {
      await generateKey(param => param.onSuccess());
      const id = client.calls({op: 'create', type: 'tabris.CryptoKey'})[0].id;
      const calls = client.calls({op: 'call', id, method: 'generate'});
      expect(calls.length).to.equal(1);
      expect(calls[0].parameters).to.deep.include({
        algorithm: {name: 'ECDSA', namedCurve: 'P-256'},
        extractable: true,
        keyUsages: ['foo', 'bar'],
        usageRequiresAuth: false
      });
    });

    it('CREATEs public and private CryptKey', async function() {
      await generateKey(param => param.onSuccess());

      const create = client.calls({op: 'create', type: 'tabris.CryptoKey'});
      expect(create[1].properties.parent).to.equal(create[0].id);
      expect(create[1].properties.type).to.equal('private');
      expect(create[2].properties.parent).to.equal(create[0].id);
      expect(create[2].properties.type).to.equal('public');
    });

    it('propagates rejection and disposes CryptoKey', async function() {
      await expect(generateKey(param => param.onError('fooerror')))
        .rejectedWith(Error, 'fooerror');
      const {id} = client.calls({op: 'create', type: 'tabris.CryptoKey'})[0];
      expect(client.calls({op: 'destroy', id}));
    });

    it('checks parameter length', async function() {
      params.pop(); // removes optional parameter `options`
      params.pop(); // removes required parameter `usages`
      await expect(generateKey())
        .rejectedWith(TypeError, 'Expected at least 3 arguments, got 2');
      expect(client.calls({op: 'create', type: 'tabris.CryptoKey'}).length).to.equal(0);
    });

    it('checks algorithm.name', async function() {
      // @ts-ignore
      params[0].name = 'foo';
      await expect(generateKey())
        .rejectedWith(TypeError, 'algorithm.name must be "ECDH" or "ECDSA", got "foo"');
      expect(client.calls({op: 'create', type: 'tabris.CryptoKey'}).length).to.equal(0);
    });

    it('checks algorithm.namedCurve', async function() {
      // @ts-ignore
      params[0].namedCurve = 'foo';
      await expect(generateKey())
        .rejectedWith(TypeError, 'algorithm.namedCurve must be "P-256", got "foo"');
      expect(client.calls({op: 'create', type: 'tabris.CryptoKey'}).length).to.equal(0);
    });

    it('checks extractable', async function() {
      params[1] = null;
      await expect(generateKey())
        .rejectedWith(TypeError, 'Expected extractable to be a boolean, got null');
      expect(client.calls({op: 'create', type: 'tabris.CryptoKey'}).length).to.equal(0);
    });

    it('checks key usages', async function() {
      params[2] = null;
      await expect(generateKey())
        .rejectedWith(TypeError, 'Expected keyUsages to be an array, got null');
      expect(client.calls({op: 'create', type: 'tabris.CryptoKey'}).length).to.equal(0);
    });

    it('checks options.usageRequiresAuth type', async function() {
      params[3] = {usageRequiresAuth: null};
      await expect(generateKey())
        .rejectedWith(TypeError, 'Expected options.usageRequiresAuth to be a boolean, got null');
      expect(client.calls({op: 'create', type: 'tabris.CryptoKey'}).length).to.equal(0);
    });

    it('rejects options.usageRequiresAuth when key is extractable', async function() {
      params[1] = true;
      params[3] = {usageRequiresAuth: true};
      await expect(generateKey())
        .rejectedWith(TypeError, 'options.usageRequiresAuth is only supported for non-extractable EC keys');
      expect(client.calls({op: 'create', type: 'tabris.CryptoKey'}).length).to.equal(0);
    });

    it('does not reject options.usageRequiresAuth for non-extractable EC keys', async function() {
      (tabris as any).device.platform = 'Android';
      params[1] = false;
      params[3] = {usageRequiresAuth: true};
      await generateKey(param => param.onSuccess());
      expect(client.calls({op: 'create', type: 'tabris.CryptoKey'}).length).to.be.greaterThan(0);
    });

  });

  describe('subtle.sign()', function() {
    let params: Parameters<typeof crypto.subtle.sign>;
    let data: ArrayBuffer;
    let key: _CryptoKey;

    async function sign(cb?: (nativeParams: any) => void) {
      const promise = crypto.subtle.sign.apply(crypto.subtle, params);
      cb?.call(null, client.calls({op: 'call', method: 'subtleSign'})[0].parameters);
      return promise;
    }

    beforeEach(function() {
      client.resetCalls();
      data = new ArrayBuffer(10);
      key = new _CryptoKey();
      params = [
        {name: 'ECDSAinDERFormat', hash: 'SHA-256'},
        new CryptoKey(key, {}),
        data
      ];
    });

    it('CALLs subtleSign', async function() {
      await sign(param => param.onSuccess());
      const signCalls = client.calls({op: 'call', method: 'subtleSign'});
      expect(signCalls.length).to.equal(1);
      expect(signCalls[0].parameters).to.deep.include({
        algorithm: {name: 'ECDSAinDERFormat', hash: 'SHA-256'},
        key: key.cid,
        data
      });
    });

    it('returns signed data', async function() {
      const signed = new ArrayBuffer(2);
      expect(await sign(param => param.onSuccess(signed)))
        .to.equal(signed);
    });

    it('propagates rejection', async function() {
      await expect(sign(param => param.onError('signerror')))
        .rejectedWith(Error, 'signerror');
    });

    it('checks parameter length', async function() {
      params.pop();
      await expect(sign())
        .rejectedWith(TypeError, 'Expected at least 3 arguments, got 2');
      expect(client.calls({op: 'call', method: 'subtleSign'}).length).to.equal(0);
    });

    it('checks algorithm.name', async function() {
      (params[0].name as any) = 'foo';
      await expect(sign())
        .rejectedWith(TypeError, 'algorithm.name must be "ECDSAinDERFormat", got "foo"');
      expect(client.calls({op: 'call', method: 'subtleSign'}).length).to.equal(0);
    });

    it('checks algorithm.hash', async function() {
      (params[0].hash as any) = 'foo';
      await expect(sign())
        .rejectedWith(TypeError, 'algorithm.hash must be "SHA-256", got "foo"');
      expect(client.calls({op: 'call', method: 'subtleSign'}).length).to.equal(0);
    });

    it('checks key', async function() {
      params[1] = null;
      await expect(sign())
        .rejectedWith(TypeError, 'Expected key to be of type CryptoKey, got null');
      expect(client.calls({op: 'call', method: 'subtleSign'}).length).to.equal(0);
    });

    it('checks data', async function() {
      params[2] = null;
      await expect(sign())
        .rejectedWith(TypeError, 'Expected data to be of type ArrayBuffer, got null');
      expect(client.calls({op: 'call', method: 'subtleSign'}).length).to.equal(0);
    });

    it('checks options.authPromptTitle', async function() {
      params[3] = {authPromptTitle: null};
      await expect(sign())
        .rejectedWith(TypeError, 'Expected options.authPromptTitle to be a string, got null.');
      expect(client.calls({op: 'call', method: 'subtleSign'}).length).to.equal(0);
    });

    it('checks options.authPromptMessage', async function() {
      params[3] = {authPromptMessage: null};
      await expect(sign())
        .rejectedWith(TypeError, 'Expected options.authPromptMessage to be a string, got null.');
      expect(client.calls({op: 'call', method: 'subtleSign'}).length).to.equal(0);
    });

  });

  describe('subtle.verify()', function() {
    let params: Parameters<typeof crypto.subtle.verify>;
    let signature: ArrayBuffer;
    let data: ArrayBuffer;
    let key: _CryptoKey;

    async function verify(cb?: (nativeParams: any) => void) {
      const promise = crypto.subtle.verify.apply(crypto.subtle, params);
      cb?.call(null, client.calls({op: 'call', method: 'subtleVerify'})[0].parameters);
      return promise;
    }

    beforeEach(function() {
      client.resetCalls();
      signature = new ArrayBuffer(2);
      data = new ArrayBuffer(10);
      key = new _CryptoKey();
      params = [
        {name: 'ECDSAinDERFormat', hash: 'SHA-256'},
        new CryptoKey(key, {}),
        signature,
        data
      ];
    });

    it('CALLs subtleVerify', async function() {
      await verify(param => param.onSuccess(true));
      const verifyCalls = client.calls({op: 'call', method: 'subtleVerify'});
      expect(verifyCalls.length).to.equal(1);
      expect(verifyCalls[0].parameters).to.deep.include({
        algorithm: {name: 'ECDSAinDERFormat', hash: 'SHA-256'},
        key: key.cid,
        signature,
        data
      });
    });

    it('returns verification result', async function() {
      expect(await verify(param => param.onSuccess(true))).to.be.true;
    });

    it('propagates rejection', async function() {
      await expect(verify(param => param.onError('verifyerror')))
        .rejectedWith(Error, 'verifyerror');
    });

    it('checks parameter length', async function() {
      params.pop();
      await expect(verify())
        .rejectedWith(TypeError, 'Expected 4 arguments, got 3');
      expect(client.calls({op: 'call', method: 'subtleVerify'}).length).to.equal(0);
    });

    it('checks algorithm.name', async function() {
      (params[0].name as any) = 'foo';
      await expect(verify())
        .rejectedWith(TypeError, 'algorithm.name must be "ECDSAinDERFormat", got "foo"');
      expect(client.calls({op: 'call', method: 'subtleVerify'}).length).to.equal(0);
    });

    it('checks algorithm.hash', async function() {
      (params[0].hash as any) = 'foo';
      await expect(verify())
        .rejectedWith(TypeError, 'algorithm.hash must be "SHA-256", got "foo"');
      expect(client.calls({op: 'call', method: 'subtleVerify'}).length).to.equal(0);
    });

    it('checks key', async function() {
      params[1] = null;
      await expect(verify())
        .rejectedWith(TypeError, 'Expected key to be of type CryptoKey, got null');
      expect(client.calls({op: 'call', method: 'subtleVerify'}).length).to.equal(0);
    });

    it('checks signature', async function() {
      params[2] = null;
      await expect(verify())
        .rejectedWith(TypeError, 'Expected signature to be of type ArrayBuffer, got null');
      expect(client.calls({op: 'call', method: 'subtleVerify'}).length).to.equal(0);
    });

    it('checks data', async function() {
      params[3] = null;
      await expect(verify())
        .rejectedWith(TypeError, 'Expected data to be of type ArrayBuffer, got null');
      expect(client.calls({op: 'call', method: 'subtleVerify'}).length).to.equal(0);
    });
  });

});
