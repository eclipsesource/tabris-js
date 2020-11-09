import {expect, mockTabris, restore, stub} from '../test';
import ClientMock from './ClientMock';
import Pkcs5 from '../../src/tabris/Pkcs5';

describe('Pkcs5', function() {

  let client;
  let pkcs5;
  const returnValue = new Uint8Array(32);
  const expectFail = () => {throw new Error('expected to fail');};

  beforeEach(function() {
    client = new ClientMock();
    mockTabris(client);
    pkcs5 = new Pkcs5();
    stub(client, 'call').callsFake((id, method) => {
      if (method === 'start') {
        setTimeout(() => {
          global.tabris._notify(id, 'done', {key: returnValue});
        });
      } else if (method === 'pbkdf2Sync') {
        return returnValue;
      }
    });
  });

  afterEach(restore);

  describe('pbkdf2', function() {

    it('fails with missing arguments', function() {
      return pkcs5.pbkdf2(1, 2, 3).then(expectFail, (err) => {
        expect(err.message).to.equal('Not enough arguments to pbkdf2');
      });
    });

    it('fails with invalid password', function() {
      return pkcs5.pbkdf2(null, [], 32, 1000).then(expectFail, (err) => {
        expect(err.message).to.equal('Invalid type for password in pbkdf2');
      });
    });

    it('fails with plain array as salt', function() {
      return pkcs5.pbkdf2('password', [0, 0, 0], 32, 1000).then(expectFail, (err) => {
        expect(err.message).to.equal('Invalid type for salt in pbkdf2');
      });
    });

    it('passes parameters to `start` CALL operation', function() {
      return pkcs5.pbkdf2('password', new Uint8Array([0, 128, 255]), 32, 1000).then(() => {
        expect(client.call).to.have.been.called;
        expect(client.call.args[0][1]).to.equal('start');
        expect(client.call.args[0][2]).to.deep.equal({
          password: 'password',
          salt: [0, 128, 255],
          iterationCount: 32,
          keySize: 1000
        });
      });
    });

    it('returns a Promise that is resolved on `done` event', function() {
      return pkcs5.pbkdf2('password', new Uint8Array(20), 32, 1000).then((result) => {
        expect(result).to.equal(returnValue);
      });
    });

    it('destroys intermediate object after `done` event', function() {
      return pkcs5.pbkdf2('password', new Uint8Array(20), 32, 1000).then(() => {
        const createCall = client.calls({op: 'create'})[0];
        const destroyCall = client.calls({op: 'destroy'})[0];
        expect(destroyCall.id).to.equal(createCall.id);
      });
    });

  });

  describe('pbkdf2Sync', function() {

    it('fails with missing arguments', function() {
      expect(() => {
        pkcs5.pbkdf2Sync(1, 2, 3);
      }).to.throw('Not enough arguments to pbkdf2Sync');
    });

    it('fails with invalid password', function() {
      expect(() => {
        pkcs5.pbkdf2Sync(null, [], 32, 1000);
      }).to.throw('Invalid type for password in pbkdf2');
    });

    it('fails with plain array as salt', function() {
      expect(() => {
        pkcs5.pbkdf2Sync('password', [0, 0, 0], 32, 1000);
      }).to.throw('Invalid type for salt in pbkdf2');
    });

    it('passes parameters to `pbkdf2Sync` CALL operation', function() {
      pkcs5.pbkdf2Sync('password', new Uint8Array([0, 128, 255]), 32, 1000);
      expect(client.call).to.have.been.called;
      expect(client.call.args[0][1]).to.equal('pbkdf2Sync');
      expect(client.call.args[0][2]).to.deep.equal({
        password: 'password',
        salt: new Uint8Array([0, 128, 255]),
        iterationCount: 32,
        keySize: 1000
      });
    });

    it('returns pbkdf2Sync call result', function() {
      const result = pkcs5.pbkdf2Sync('password', new Uint8Array(20), 32, 1000);

      expect(result).to.equal(returnValue);
    });

    it('destroys intermediate object after `pbkdf2Sync` call', function() {
      pkcs5.pbkdf2Sync('password', new Uint8Array(20), 32, 1000);
      const createCall = client.calls({op: 'create'})[0];
      const destroyCall = client.calls({op: 'destroy'})[0];
      expect(destroyCall.id).to.equal(createCall.id);
    });

  });

});
