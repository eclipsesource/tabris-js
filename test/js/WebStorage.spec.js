describe("LocalStorage", function() {

  var nativeBridge;
  var proxy;
  var localStorage;

  beforeEach(function() {
    nativeBridge = new NativeBridgeSpy();
    tabris._reset();
    tabris._init(nativeBridge);
    spyOn(window, "tabris").and.callFake(function() {
      proxy = new tabris.Proxy();
      spyOn(proxy, "_nativeCall").and.callFake(function(method, args) {
        if (method === "get" && args.key === "savedKey") {
          return "savedVal";
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

    it("doesn't call add when key not a string", function() {
      executeWithNonStringArgument(localStorage, "setItem", 0, "foo");
      expect(proxy._nativeCall).not.toHaveBeenCalled();
    });

    it("doesn't call add when value not a string", function() {
      executeWithNonStringArgument(localStorage, "setItem", 1, "foo");
      expect(proxy._nativeCall).not.toHaveBeenCalled();
    });

  });

  describe("getItem", function() {

    it("doesn't call get when key not a string", function() {
      executeWithNonStringArgument(localStorage, "getItem", 0);
      expect(proxy._nativeCall).not.toHaveBeenCalled();
    });

    it("calls proxy get with key", function() {
      localStorage.getItem("foo");
      expect(proxy._nativeCall).toHaveBeenCalledWith("get", {key: "foo"});
    });

    it("returns saved item", function() {
      var item = localStorage.getItem("savedKey");
      expect(item).toBe("savedVal");
    });

  });

  describe("removeItem", function() {

    it("doesn't call remove when key not a string", function() {
      executeWithNonStringArgument(localStorage, "removeItem", 0);
      expect(proxy._nativeCall).not.toHaveBeenCalled();
    });

    it("calls proxy remove with keys array", function() {
      localStorage.removeItem("savedKey");
      expect(proxy._nativeCall).toHaveBeenCalledWith("remove", {keys: ["savedKey"]});
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

  var executeWithNonStringArgument = function(target, method, nonStringIndex) {
    var functionArgs = arguments;
    [function() {}, 2, true, {foo: "bar"}].forEach(function(nonString) {
      var args = [];
      args[nonStringIndex] = nonString;
      fillInFunctionArgsInTargetMethodArgs(args, nonStringIndex, functionArgs);
      target[method].apply(this, args);
    });
  };

  var fillInFunctionArgsInTargetMethodArgs = function(args, nonStringIndex, functionArgs) {
    var pos = 0;
    for (var i = 3; i < functionArgs.length; i++) {
      if (pos < nonStringIndex) {
        args[pos++] = functionArgs[i];
      } else {
        args.push(functionArgs[i]);
      }
    }
  };

});
