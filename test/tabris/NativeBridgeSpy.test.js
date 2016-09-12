import {expect, spy, restore} from "../test";
import NativeBridgeSpy from "./NativeBridgeSpy";
import NativeBridge from "../../src/tabris/NativeBridge";
import ProxyStore from "../../src/tabris/ProxyStore";

describe("NativeBridgeSpy", function() {

  let nativeBridge;

  beforeEach(function() {
    nativeBridge = new NativeBridgeSpy();
    global.tabris = {
      on: () => {},
      _proxies: new ProxyStore()
    };
    global.tabris._nativeBridge = new NativeBridge(nativeBridge);
    tabris._nativeBridge = {flush: spy()};
  });

  afterEach(restore);

  describe("calls are recorded", function() {

    it("create", function() {
      let props = {};
      nativeBridge.create("id", "type", props);

      let call = nativeBridge.calls()[0];
      expect(call.op).to.equal("create");
      expect(call.id).to.equal("id");
      expect(call.type).to.equal("type");
      expect(call.properties).to.equal(props);
    });

    it("get", function() {
      nativeBridge.get("id", "prop");

      let call = nativeBridge.calls()[0];
      expect(call.op).to.equal("get");
      expect(call.id).to.equal("id");
      expect(call.property).to.equal("prop");
    });

    it("set", function() {
      let props = {};
      nativeBridge.set("id", props);

      let call = nativeBridge.calls()[0];
      expect(call.op).to.equal("set");
      expect(call.id).to.equal("id");
      expect(call.properties).to.equal(props);
    });

    it("call", function() {
      let params = {};
      nativeBridge.call("id", "method", params);

      let call = nativeBridge.calls()[0];
      expect(call.op).to.equal("call");
      expect(call.id).to.equal("id");
      expect(call.method).to.equal("method");
      expect(call.parameters).to.equal(params);
    });

    it("listen", function() {
      nativeBridge.listen("id", "event", true);

      let call = nativeBridge.calls()[0];
      expect(call.op).to.equal("listen");
      expect(call.id).to.equal("id");
      expect(call.event).to.equal("event");
      expect(call.listen).to.equal(true);
    });

    it("destroy", function() {
      nativeBridge.destroy("id");

      let call = nativeBridge.calls()[0];
      expect(call.op).to.equal("destroy");
      expect(call.id).to.equal("id");
    });

  });

  describe("without any calls", function() {

    it("result list is empty", function() {
      expect(nativeBridge.calls().length).to.equal(0);
    });

  });

  describe("when calls have been made", function() {

    beforeEach(function() {
      nativeBridge.create("id1", "type1", {foo: 1});
      nativeBridge.create("id2", "type2", {foo: 2});
      nativeBridge.set("id1", {bar: 1});
      nativeBridge.set("id2", {bar: 2});
    });

    it("result list has contains all calls", function() {
      expect(nativeBridge.calls().length).to.equal(4);
    });

    it("result list can be filtered", function() {
      expect(nativeBridge.calls({id: "id1"}).length).to.equal(2);
    });

  });

});
