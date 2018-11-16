import {expect, mockTabris, stub, restore} from '../test';
import Storage, {create as createStorage} from '../../src/tabris/Storage';
import ClientStub from './ClientStub';

describe('Storage', function() {

  let client;
  let returnValue;

  beforeEach(function() {
    client = new ClientStub();
    mockTabris(client);
    stub(client, 'call').callsFake(() => returnValue);
  });

  afterEach(restore);

  describe('create', function() {

    it('creates a native ClientStore object', function() {
      createStorage();
      expect(client.calls({op: 'create', type: 'tabris.ClientStore'})).to.not.be.empty;
    });

    it('creates a native SecureStore object', function() {
      createStorage(true);
      expect(client.calls({op: 'create', type: 'tabris.SecureStore'})).to.not.be.empty;
    });

  });

  describe('instance', function() {

    let storage, cid;

    beforeEach(function() {
      storage = createStorage();
      stub(client, 'create').callsFake((id, type) => {
        if (type === 'tabris.ClientStore') {
          cid = id;
        }
      });
    });

    it('does not have any enumerable Object keys', function() {
      expect(Object.keys(storage).length).to.equal(0);
    });

    describe('setItem', function() {

      it('fails with missing argument', function() {
        expect(() => {
          storage.setItem('foo');
        }).to.throw("Not enough arguments to 'setItem'");
      });

      it('calls nativeObject add with key and value', function() {
        storage.setItem('foo', 'bar');

        expect(client.call).to.have.been.calledWith(cid, 'add', {key: 'foo', value: 'bar'});
      });

      it('call nativeObject add with stringified key', function() {
        storage.setItem(2, 'bar');

        expect(client.call).to.have.been.calledWith(cid, 'add', {key: '2', value: 'bar'});
      });

      it('calls add with stringified value', function() {
        storage.setItem('foo', 2);

        expect(client.call).to.have.been.calledWith(cid, 'add', {key: 'foo', value: '2'});
      });

      it('works with falsy keys and values', function() {
        storage.setItem(false, false);
        storage.setItem(undefined, undefined);

        expect(client.call).to.have.been.calledWith(cid, 'add', {key: 'false', value: 'false'});
        expect(client.call).to.have.been.calledWith(cid, 'add', {key: 'undefined', value: 'undefined'});
      });

    });

    describe('getItem', function() {

      it('fails with missing argument', function() {
        expect(() => {
          storage.getItem();
        }).to.throw("Not enough arguments to 'getItem'");
      });

      it('calls nativeObject get with key', function() {
        storage.getItem('foo');

        expect(client.call).to.have.been.calledWith(cid, 'get', {key: 'foo'});
      });

      it('calls get with stringified key', function() {
        storage.getItem(5);

        expect(client.call).to.have.been.calledWith(cid, 'get', {key: '5'});
      });

      it('works with falsy keys', function() {
        storage.getItem(false);
        storage.getItem(undefined);

        expect(client.call).to.have.been.calledWith(cid, 'get', {key: 'false'});
        expect(client.call).to.have.been.calledWith(cid, 'get', {key: 'undefined'});
      });

      it('returns saved item', function() {
        returnValue = 'bar';

        const item = storage.getItem('foo');

        expect(item).to.equal('bar');
      });

      it('returns null for undefined', function() {
        returnValue = undefined;

        const item = storage.getItem('foo');

        expect(item).to.equal(null);
      });

    });

    describe('removeItem', function() {

      it('fails with missing argument', function() {
        expect(() => {
          storage.removeItem();
        }).to.throw("Not enough arguments to 'removeItem'");
      });

      it('calls nativeObject remove with keys array', function() {
        storage.removeItem('foo');

        expect(client.call).to.have.been.calledWith(cid, 'remove', {keys: ['foo']});
      });

      it('calls nativeObject remove with keys array with stringified key', function() {
        storage.removeItem(3);

        expect(client.call).to.have.been.calledWith(cid, 'remove', {keys: ['3']});
      });

      it('works with falsy keys', function() {
        storage.removeItem(false);
        storage.removeItem(undefined);

        expect(client.call).to.have.been.calledWith(cid, 'remove', {keys: ['false']});
        expect(client.call).to.have.been.calledWith(cid, 'remove', {keys: ['undefined']});
      });

    });

    describe('clear', function() {

      it('calls nativeObject clear', function() {
        storage.clear();

        expect(client.call).to.have.been.calledWith(cid, 'clear', undefined);
      });

    });

    describe('Storage constructor', function() {

      it('is a function', function() {
        expect(Storage).to.be.a('function');
      });

      it('does not declare formal parameters', function() {
        expect(Storage.length).to.equal(0);
      });

    });

  });

});
