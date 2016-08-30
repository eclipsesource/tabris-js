describe("ProxyStore", function() {

  var store, proxy;

  beforeEach(function() {
    tabris._reset();
    store = tabris._proxies;
    proxy = {};
  });

  describe("register without cid", function() {

    it("returns generated cid", function() {
      var cid = store.register(proxy);
      expect(cid).toBe("o1");
    });

    it("returns different generated cids", function() {
      var cid1 = store.register(proxy);
      var cid2 = store.register(proxy);
      expect(cid1).not.toBe(cid2);
    });

  });

  describe("register with fixed cid", function() {

    it("returns given cid", function() {
      var cid = store.register(proxy, "fixed");
      expect(cid).toBe("fixed");
    });

    it("throws when registered twice", function() {
      store.register(proxy, "fixed");
      expect(() => store.register(proxy, "fixed")).toThrowError(/cid.*fixed/);
    });

  });

  describe("find", function() {

    it("returns proxy with generated cid", function() {
      var cid = store.register(proxy);
      expect(store.find(cid)).toBe(proxy);
    });

    it("returns proxy with fixed cid", function() {
      store.register(proxy, "fixed");
      expect(store.find("fixed")).toBe(proxy);
    });

    it("returns null for unknown cid", function() {
      expect(store.find("unknown")).toBeNull();
    });

  });

  describe("remove", function() {

    it("removes registered proxy", function() {
      var cid = store.register(proxy);
      store.remove(cid);
      expect(store.find(cid)).toBeNull();
    });

  });

});
