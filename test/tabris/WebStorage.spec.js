describe("LocalStorage", function() {

  var nativeBridge;
  var localStorage;
  var returnValue;
  var cid = "tabris.ClientStore";

  beforeEach(function() {
    nativeBridge = new NativeBridgeSpy();
    tabris._reset();
    tabris._init(nativeBridge);
    localStorage = new tabris.WebStorage();
    spyOn(nativeBridge, "call").and.callFake(function() {
      return returnValue;
    });
  });

  afterEach(function() {
    nativeBridge = null;
    localStorage = null;
  });

  describe("setItem", function() {

    it("fails with missing argument", function() {
      expect(() => {
        localStorage.setItem("foo");
      }).toThrowError("Not enough arguments to 'setItem'");
    });

    it("calls proxy add with key and value", function() {
      localStorage.setItem("foo", "bar");

      expect(nativeBridge.call).toHaveBeenCalledWith(cid, "add", {key: "foo", value: "bar"});
    });

    it("call proxy add with stringified key", function() {
      localStorage.setItem(2, "bar");

      expect(nativeBridge.call).toHaveBeenCalledWith(cid, "add", {key: "2", value: "bar"});
    });

    it("calls add with stringified value", function() {
      localStorage.setItem("foo", 2);

      expect(nativeBridge.call).toHaveBeenCalledWith(cid, "add", {key: "foo", value: "2"});
    });

    it("works with falsy keys and values", function() {
      localStorage.setItem(false, false);
      localStorage.setItem(undefined, undefined);

      expect(nativeBridge.call).toHaveBeenCalledWith(cid, "add", {key: "false", value: "false"});
      expect(nativeBridge.call).toHaveBeenCalledWith(cid, "add", {key: "undefined", value: "undefined"});
    });

  });

  describe("getItem", function() {

    it("fails with missing argument", function() {
      expect(() => {
        localStorage.getItem();
      }).toThrowError("Not enough arguments to 'getItem'");
    });

    it("calls proxy get with key", function() {
      localStorage.getItem("foo");

      expect(nativeBridge.call).toHaveBeenCalledWith(cid, "get", {key: "foo"});
    });

    it("calls get with stringified key", function() {
      localStorage.getItem(5);

      expect(nativeBridge.call).toHaveBeenCalledWith(cid, "get", {key: "5"});
    });

    it("works with falsy keys", function() {
      localStorage.getItem(false);
      localStorage.getItem(undefined);

      expect(nativeBridge.call).toHaveBeenCalledWith(cid, "get", {key: "false"});
      expect(nativeBridge.call).toHaveBeenCalledWith(cid, "get", {key: "undefined"});
    });

    it("returns saved item", function() {
      returnValue = "bar";

      var item = localStorage.getItem("foo");

      expect(item).toBe("bar");
    });

    it("returns null for undefined", function() {
      returnValue = undefined;

      var item = localStorage.getItem("foo");

      expect(item).toBe(null);
    });

  });

  describe("removeItem", function() {

    it("fails with missing argument", function() {
      expect(() => {
        localStorage.removeItem();
      }).toThrowError("Not enough arguments to 'removeItem'");
    });

    it("calls proxy remove with keys array", function() {
      localStorage.removeItem("foo");

      expect(nativeBridge.call).toHaveBeenCalledWith(cid, "remove", {keys: ["foo"]});
    });

    it("calls proxy remove with keys array with stringified key", function() {
      localStorage.removeItem(3);

      expect(nativeBridge.call).toHaveBeenCalledWith(cid, "remove", {keys: ["3"]});
    });

    it("works with falsy keys", function() {
      localStorage.removeItem(false);
      localStorage.removeItem(undefined);

      expect(nativeBridge.call).toHaveBeenCalledWith(cid, "remove", {keys: ["false"]});
      expect(nativeBridge.call).toHaveBeenCalledWith(cid, "remove", {keys: ["undefined"]});
    });

  });

  describe("clear", function() {

    it("calls proxy clear", function() {
      localStorage.clear();

      expect(nativeBridge.call).toHaveBeenCalledWith(cid, "clear", undefined);
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
