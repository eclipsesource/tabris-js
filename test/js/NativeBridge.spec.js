describe("NativeBridge", function() {

  var native;
  var bridge;
  var log;

  beforeEach(function() {
    tabris.off();
    log = [];
    native = {};
    ["create", "destroy", "listen", "set", "get", "call"].forEach(function(method) {
      native[method] = jasmine.createSpy(method).and.callFake(function() {
        log.push(method);
        return 23;
      });
    });
    bridge = new tabris.NativeBridge(native);
  });

  describe("create", function() {
    beforeEach(function() {
      bridge.create("id", "type");
    });

    it("is not transferred immediately", function() {
      expect(native.destroy).not.toHaveBeenCalled();
    });

    it("is transferred on flush", function() {
      tabris.trigger("flush");
      expect(native.create).toHaveBeenCalledWith("id", "type", {});
    });
  });

  describe("set", function() {
    beforeEach(function() {
      bridge.set("id", "foo", 23);
    });

    it("is not transferred immediately", function() {
      expect(native.set).not.toHaveBeenCalled();
    });

    it("is transferred on flush", function() {
      tabris.trigger("flush");
      expect(native.set).toHaveBeenCalledWith("id", {foo: 23});
    });
  });

  describe("subsequent create and set properties", function() {
    beforeEach(function() {
      bridge.create("id", "type");
      bridge.set("id", "foo", 23);
      bridge.set("id", "bar", 42);
    });

    it("is not transferred immediately", function() {
      expect(native.create).not.toHaveBeenCalled();
      expect(native.set).not.toHaveBeenCalled();
    });

    it("is transferred on flush", function() {
      tabris.trigger("flush");
      expect(native.create).toHaveBeenCalledWith("id", "type", {foo: 23, bar: 42});
      expect(native.set).not.toHaveBeenCalled();
    });
  });

  describe("listen", function() {
    beforeEach(function() {
      bridge.listen("id", "event", false);
    });

    it("is not transferred immediately", function() {
      expect(native.listen).not.toHaveBeenCalled();
    });

    it("is transferred on flush", function() {
      tabris.trigger("flush");
      expect(native.listen).toHaveBeenCalledWith("id", "event", false);
    });
  });

  describe("destroy", function() {
    beforeEach(function() {
      bridge.destroy("id");
    });

    it("is not transferred immediately", function() {
      expect(native.create).not.toHaveBeenCalled();
    });

    it("is transferred on flush", function() {
      tabris.trigger("flush");
      expect(native.destroy).toHaveBeenCalledWith("id");
    });
  });

  describe("get", function() {
    beforeEach(function() {
      bridge.set("id", {foo: 23});
    });

    it("is transferred immediately", function() {
      bridge.get("id", "foo");
      expect(native.get).toHaveBeenCalledWith("id", "foo");
    });

    it("returns a value", function() {
      var result = bridge.get("id", "foo");
      expect(result).toBe(23);
    });

    it("flushes buffered operations first", function() {
      bridge.get("id", "foo");
      expect(log).toEqual(["set", "get"]);
    });

    it("allows operation to be added in beforeFlush event", function() {
      tabris.on("beforeFlush", function() {
        bridge.set("id2", {bar: 23});
      });
      bridge.get("id", "foo");
      expect(log).toEqual(["set", "set", "get"]);
    });
  });

  describe("call", function() {
    beforeEach(function() {
      bridge.set("id", {foo: 23});
    });

    it("is transferred immediately", function() {
      bridge.call("id", "foo", {foo: 23});
      expect(native.call).toHaveBeenCalledWith("id", "foo", {foo: 23});
    });

    it("returns a value", function() {
      var result = bridge.call("id", "foo", {foo: 23});
      expect(result).toBe(23);
    });

    it("flushes buffered operations first", function() {
      bridge.call("id", "foo", {foo: 23});
      expect(log).toEqual(["set", "call"]);
    });

    it("allows operation to be added in beforeFlush event", function() {
      tabris.on("beforeFlush", function() {
        bridge.set("id2", {bar: 23});
      });
      bridge.call("id", "foo", {foo: 23});
      expect(log).toEqual(["set", "set", "call"]);
    });
  });

});
