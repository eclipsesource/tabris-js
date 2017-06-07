import {expect} from '../test';
import ProxyStore from '../../src/tabris/ProxyStore';

describe('ProxyStore', function() {

  let store, proxy;

  beforeEach(function() {
    store = new ProxyStore();
    proxy = {};
  });

  describe('register', function() {

    it('returns generated cid', function() {
      let cid = store.register(proxy);
      expect(cid).to.equal('o1');
    });

    it('returns different generated cids', function() {
      let cid1 = store.register(proxy);
      let cid2 = store.register(proxy);
      expect(cid1).not.to.equal(cid2);
    });

  });

  describe('find', function() {

    it('returns proxy with generated cid', function() {
      let cid = store.register(proxy);
      expect(store.find(cid)).to.equal(proxy);
    });

    it('returns null for unknown cid', function() {
      expect(store.find('unknown')).to.be.null;
    });

  });

  describe('remove', function() {

    it('removes registered proxy', function() {
      let cid = store.register(proxy);
      store.remove(cid);
      expect(store.find(cid)).to.be.null;
    });

  });

});
