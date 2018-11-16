import {expect} from '../test';
import NativeObjectRegistry from '../../src/tabris/NativeObjectRegistry';

describe('NativeObjectRegistry', function() {

  let store, nativeObject;

  beforeEach(function() {
    store = new NativeObjectRegistry();
    nativeObject = {};
  });

  describe('register', function() {

    it('returns generated cid', function() {
      const cid = store.register(nativeObject);
      expect(cid).to.equal('$1');
    });

    it('returns different generated cids', function() {
      const cid1 = store.register(nativeObject);
      const cid2 = store.register(nativeObject);
      expect(cid1).not.to.equal(cid2);
    });

  });

  describe('find', function() {

    it('returns nativeObject with generated cid', function() {
      const cid = store.register(nativeObject);
      expect(store.find(cid)).to.equal(nativeObject);
    });

    it('returns null for unknown cid', function() {
      expect(store.find('unknown')).to.be.null;
    });

  });

  describe('remove', function() {

    it('removes registered nativeObject', function() {
      const cid = store.register(nativeObject);
      store.remove(cid);
      expect(store.find(cid)).to.be.null;
    });

  });

});
