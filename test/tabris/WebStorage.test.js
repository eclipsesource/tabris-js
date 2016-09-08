import {expect, stub} from "../test";
import WebStorage, {create as createWebStorage} from "../../src/tabris/WebStorage";
import ProxyStore from "../../src/tabris/ProxyStore";
import NativeBridge from "../../src/tabris/NativeBridge";
import NativeBridgeSpy from "./NativeBridgeSpy";

describe("WebStorage", function() {

  let nativeBridge;
  let storage;
  let returnValue;
  let cid = "tabris.ClientStore";

  beforeEach(function() {
    nativeBridge = new NativeBridgeSpy();
    global.tabris = {
      on: () => {},
      _proxies: new ProxyStore()
    };
    global.tabris._nativeBridge = new NativeBridge(nativeBridge);
    storage = createWebStorage();
    stub(nativeBridge, "call", () => returnValue);
  });

  afterEach(function() {
    nativeBridge = null;
    storage = null;
  });

  it("does not have any enumerable Object keys", function() {
    expect(Object.keys(storage).length).to.equal(0);
  });

  describe("setItem", function() {

    it("fails with missing argument", function() {
      expect(() => {
        storage.setItem("foo");
      }).to.throw("Not enough arguments to 'setItem'");
    });

    it("calls proxy add with key and value", function() {
      storage.setItem("foo", "bar");

      expect(nativeBridge.call).to.have.been.calledWith(cid, "add", {key: "foo", value: "bar"});
    });

    it("call proxy add with stringified key", function() {
      storage.setItem(2, "bar");

      expect(nativeBridge.call).to.have.been.calledWith(cid, "add", {key: "2", value: "bar"});
    });

    it("calls add with stringified value", function() {
      storage.setItem("foo", 2);

      expect(nativeBridge.call).to.have.been.calledWith(cid, "add", {key: "foo", value: "2"});
    });

    it("works with falsy keys and values", function() {
      storage.setItem(false, false);
      storage.setItem(undefined, undefined);

      expect(nativeBridge.call).to.have.been.calledWith(cid, "add", {key: "false", value: "false"});
      expect(nativeBridge.call).to.have.been.calledWith(cid, "add", {key: "undefined", value: "undefined"});
    });

  });

  describe("getItem", function() {

    it("fails with missing argument", function() {
      expect(() => {
        storage.getItem();
      }).to.throw("Not enough arguments to 'getItem'");
    });

    it("calls proxy get with key", function() {
      storage.getItem("foo");

      expect(nativeBridge.call).to.have.been.calledWith(cid, "get", {key: "foo"});
    });

    it("calls get with stringified key", function() {
      storage.getItem(5);

      expect(nativeBridge.call).to.have.been.calledWith(cid, "get", {key: "5"});
    });

    it("works with falsy keys", function() {
      storage.getItem(false);
      storage.getItem(undefined);

      expect(nativeBridge.call).to.have.been.calledWith(cid, "get", {key: "false"});
      expect(nativeBridge.call).to.have.been.calledWith(cid, "get", {key: "undefined"});
    });

    it("returns saved item", function() {
      returnValue = "bar";

      let item = storage.getItem("foo");

      expect(item).to.equal("bar");
    });

    it("returns null for undefined", function() {
      returnValue = undefined;

      let item = storage.getItem("foo");

      expect(item).to.equal(null);
    });

  });

  describe("removeItem", function() {

    it("fails with missing argument", function() {
      expect(() => {
        storage.removeItem();
      }).to.throw("Not enough arguments to 'removeItem'");
    });

    it("calls proxy remove with keys array", function() {
      storage.removeItem("foo");

      expect(nativeBridge.call).to.have.been.calledWith(cid, "remove", {keys: ["foo"]});
    });

    it("calls proxy remove with keys array with stringified key", function() {
      storage.removeItem(3);

      expect(nativeBridge.call).to.have.been.calledWith(cid, "remove", {keys: ["3"]});
    });

    it("works with falsy keys", function() {
      storage.removeItem(false);
      storage.removeItem(undefined);

      expect(nativeBridge.call).to.have.been.calledWith(cid, "remove", {keys: ["false"]});
      expect(nativeBridge.call).to.have.been.calledWith(cid, "remove", {keys: ["undefined"]});
    });

  });

  describe("clear", function() {

    it("calls proxy clear", function() {
      storage.clear();

      expect(nativeBridge.call).to.have.been.calledWith(cid, "clear", undefined);
    });

  });

  describe("Storage constructor", function() {

    it("is a function", function() {
      expect(WebStorage).to.be.a("function");
    });

    it("does not declare formal paramters", function() {
      expect(WebStorage.length).to.equal(0);
    });

  });

});
