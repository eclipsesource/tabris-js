import {expect, spy, restore} from "../test";
import ClientStub from "./ClientStub";
import NativeBridge from "../../src/tabris/NativeBridge";
import ProxyStore from "../../src/tabris/ProxyStore";

describe("ClientStub", function() {

  let client;

  beforeEach(function() {
    client = new ClientStub();
    global.tabris = {
      on: () => {},
      _proxies: new ProxyStore()
    };
    global.tabris._nativeBridge = new NativeBridge(client);
    tabris._nativeBridge = {flush: spy()};
  });

  afterEach(restore);

  describe("calls are recorded", function() {

    it("create", function() {
      let props = {};
      client.create("id", "type", props);

      let call = client.calls()[0];
      expect(call.op).to.equal("create");
      expect(call.id).to.equal("id");
      expect(call.type).to.equal("type");
      expect(call.properties).to.equal(props);
    });

    it("get", function() {
      client.get("id", "prop");

      let call = client.calls()[0];
      expect(call.op).to.equal("get");
      expect(call.id).to.equal("id");
      expect(call.property).to.equal("prop");
    });

    it("set", function() {
      let props = {};
      client.set("id", props);

      let call = client.calls()[0];
      expect(call.op).to.equal("set");
      expect(call.id).to.equal("id");
      expect(call.properties).to.equal(props);
    });

    it("call", function() {
      let params = {};
      client.call("id", "method", params);

      let call = client.calls()[0];
      expect(call.op).to.equal("call");
      expect(call.id).to.equal("id");
      expect(call.method).to.equal("method");
      expect(call.parameters).to.equal(params);
    });

    it("listen", function() {
      client.listen("id", "event", true);

      let call = client.calls()[0];
      expect(call.op).to.equal("listen");
      expect(call.id).to.equal("id");
      expect(call.event).to.equal("event");
      expect(call.listen).to.equal(true);
    });

    it("destroy", function() {
      client.destroy("id");

      let call = client.calls()[0];
      expect(call.op).to.equal("destroy");
      expect(call.id).to.equal("id");
    });

  });

  describe("without any calls", function() {

    it("result list is empty", function() {
      expect(client.calls().length).to.equal(0);
    });

  });

  describe("when calls have been made", function() {

    beforeEach(function() {
      client.create("id1", "type1", {foo: 1});
      client.create("id2", "type2", {foo: 2});
      client.set("id1", {bar: 1});
      client.set("id2", {bar: 2});
    });

    it("result list has contains all calls", function() {
      expect(client.calls().length).to.equal(4);
    });

    it("result list can be filtered", function() {
      expect(client.calls({id: "id1"}).length).to.equal(2);
    });

  });

});
