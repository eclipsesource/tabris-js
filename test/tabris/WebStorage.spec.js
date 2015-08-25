describe("LocalStorage", function() {

  var nativeBridge;
  var proxy;
  var localStorage;
  var returnValue;

  beforeEach(function() {
    returnValue = "savedVal";
    nativeBridge = new NativeBridgeSpy();
    tabris._reset();
    tabris._init(nativeBridge);
    spyOn(window, "tabris").and.callFake(function() {
      proxy = new tabris.Proxy();
      spyOn(proxy, "_nativeCall").and.callFake(function(method, args) {
        if (method === "get" && args.key === "savedKey") {
          return returnValue;
        }
        return null;
      });
      return proxy;
    });
    localStorage = new tabris.WebStorage();
  });

  afterEach(function() {
    nativeBridge = null;
    localStorage = null;
  });

  describe("constructor", function() {
    it("creates proxy", function() {
      expect(tabris).toHaveBeenCalledWith("_ClientStore");
    });
  });

  describe("setItem", function() {

    it("fails without key", function() {
      expect(function() {
        localStorage.setItem(null, "foo");
      }).toThrowError("Key argument must be specified to execute 'setItem'");
    });

    it("fails without value", function() {
      expect(function() {
        localStorage.setItem("foo");
      }).toThrowError("Value argument must be specified to execute 'setItem'");
    });

    it("calls proxy add with key and value", function() {
      localStorage.setItem("foo", "bar");
      expect(proxy._nativeCall).toHaveBeenCalledWith("add", {key: "foo", value: "bar"});
    });

    it("call proxy add with stringified key", function() {
      localStorage.setItem(2, "bar");
      expect(proxy._nativeCall).toHaveBeenCalledWith("add", {key: "2", value: "bar"});
    });

    it("calls add with stringified value", function() {
      localStorage.setItem("foo", 2);
      expect(proxy._nativeCall).toHaveBeenCalledWith("add", {key: "foo", value: "2"});
    });

  });

  describe("getItem", function() {

    it("calls proxy get with key", function() {
      localStorage.getItem("foo");
      expect(proxy._nativeCall).toHaveBeenCalledWith("get", {key: "foo"});
    });

    it("calls get with stringified key", function() {
      localStorage.getItem(5);
      expect(proxy._nativeCall).toHaveBeenCalledWith("get", {key: "5"});
    });

    it("returns saved item", function() {
      var item = localStorage.getItem("savedKey");
      expect(item).toBe("savedVal");
    });

    it("returns null for undefined", function() {
      returnValue = undefined;
      var item = localStorage.getItem("savedKey");
      expect(item).toBe(null);
    });

  });

  describe("removeItem", function() {

    it("calls proxy remove with keys array", function() {
      localStorage.removeItem("savedKey");
      expect(proxy._nativeCall).toHaveBeenCalledWith("remove", {keys: ["savedKey"]});
    });

    it("calls proxy remove with keys array with stringified key", function() {
      localStorage.removeItem(3);
      expect(proxy._nativeCall).toHaveBeenCalledWith("remove", {keys: ["3"]});
    });

  });

  describe("clear", function() {

    it("calls proxy clear", function() {
      localStorage.clear();
      expect(proxy._nativeCall).toHaveBeenCalledWith("clear");
    });

  });

  describe("WebStorage", function() {

    it("is a function", function() { // Note: Chromium: function, Firefox: object
      expect(typeof tabris.WebStorage).toBe("function");
    });

    it("is initialized with length 0", function() {
      expect(tabris.WebStorage.length).toBe(0);
    });

  });

  it("extends WebStorage", function() {
    tabris.WebStorage.prototype.foo = "bar";
    expect(localStorage.foo).toBe("bar");
  });

  describe("StorageEvent", function() {
    it("sets default values", function() {
      var storageEvent = new tabris.StorageEvent();
      expect(storageEvent.bubbles).toBe(false);
      expect(storageEvent.cancelable).toBe(false);
      expect(storageEvent.key).toBe("");
      expect(storageEvent.oldValue).toBe(null);
      expect(storageEvent.newValue).toBe(null);
      expect(storageEvent.url).toBe("");
      expect(storageEvent.storageArea).toBe(null);
    });

    it("sets type from parameter", function() {
      var storageEvent = new tabris.StorageEvent("type");
      expect(storageEvent.type).toBe("type");
    });
  });

});
