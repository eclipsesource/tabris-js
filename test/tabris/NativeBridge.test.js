import {expect, stub, spy, restore} from "../test";
import NativeBridge from "../../src/tabris/NativeBridge";
import Layout from "../../src/tabris/Layout";

describe("NativeBridge", function() {

  let native;
  let bridge;
  let log;

  beforeEach(function() {
    global.tabris = {
      on: () => {}
    };
    log = [];
    native = {};
    ["create", "destroy", "listen", "set", "get", "call"].forEach(method => {
      native[method] = spy(() => {
        log.push(method);
        return 23;
      });
    });
    bridge = new NativeBridge(native);
  });

  afterEach(restore);

  describe("create", function() {
    beforeEach(function() {
      bridge.create("id", "type");
    });

    it("is not transferred immediately", function() {
      expect(native.destroy).to.have.not.been.called;
    });

    it("is transferred on flush", function() {
      bridge.flush();
      expect(native.create).to.have.been.calledWith("id", "type", {});
    });
  });

  describe("set", function() {
    beforeEach(function() {
      bridge.set("id", "foo", 23);
    });

    it("is not transferred immediately", function() {
      expect(native.set).to.have.not.been.called;
    });

    it("is transferred on flush", function() {
      bridge.flush();
      expect(native.set).to.have.been.calledWith("id", {foo: 23});
    });
  });

  describe("subsequent create and set properties", function() {
    beforeEach(function() {
      bridge.create("id", "type");
      bridge.set("id", "foo", 23);
      bridge.set("id", "bar", 42);
    });

    it("is not transferred immediately", function() {
      expect(native.create).to.have.not.been.called;
      expect(native.set).to.have.not.been.called;
    });

    it("is transferred on flush", function() {
      bridge.flush();
      expect(native.create).to.have.been.calledWith("id", "type", {foo: 23, bar: 42});
      expect(native.set).to.have.not.been.called;
    });
  });

  describe("listen", function() {
    beforeEach(function() {
      bridge.listen("id", "event", false);
    });

    it("is not transferred immediately", function() {
      expect(native.listen).to.have.not.been.called;
    });

    it("is transferred on flush", function() {
      bridge.flush();
      expect(native.listen).to.have.been.calledWith("id", "event", false);
    });
  });

  describe("destroy", function() {
    beforeEach(function() {
      bridge.destroy("id");
    });

    it("is not transferred immediately", function() {
      expect(native.create).to.have.not.been.called;
    });

    it("is transferred on flush", function() {
      bridge.flush();
      expect(native.destroy).to.have.been.calledWith("id");
    });
  });

  describe("get", function() {
    beforeEach(function() {
      bridge.set("id", {foo: 23});
    });

    it("is transferred immediately", function() {
      bridge.get("id", "foo");
      expect(native.get).to.have.been.calledWith("id", "foo");
    });

    it("returns a value", function() {
      let result = bridge.get("id", "foo");
      expect(result).to.equal(23);
    });

    it("flushes buffered operations first", function() {
      bridge.get("id", "foo");
      expect(log).to.eql(["set", "get"]);
    });

    it("flushes layout queue first", function() {
      stub(Layout, "flushQueue", function() {
        bridge.set("id2", {bar: 23});
      });

      bridge.get("id", "foo");

      expect(log).to.eql(["set", "set", "get"]);
    });
  });

  describe("call", function() {
    beforeEach(function() {
      bridge.set("id", {foo: 23});
    });

    it("is transferred immediately", function() {
      bridge.call("id", "foo", {foo: 23});
      expect(native.call).to.have.been.calledWith("id", "foo", {foo: 23});
    });

    it("returns a value", function() {
      let result = bridge.call("id", "foo", {foo: 23});
      expect(result).to.equal(23);
    });

    it("flushes buffered operations first", function() {
      bridge.call("id", "foo", {foo: 23});
      expect(log).to.eql(["set", "call"]);
    });

    it("allows operation to be added in beforeFlush event", function() {
      stub(Layout, "flushQueue", function() {
        bridge.set("id2", {bar: 23});
      });

      bridge.call("id", "foo", {foo: 23});

      expect(log).to.eql(["set", "set", "call"]);
    });
  });

});
