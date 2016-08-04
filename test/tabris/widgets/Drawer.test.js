import {expect} from "../../test";
import ProxyStore from "../../../src/tabris/ProxyStore";
import NativeBridge from "../../../src/tabris/NativeBridge";
import ClientStub from "../ClientStub";
import Drawer from "../../../src/tabris/widgets/Drawer";
import TextView from "../../../src/tabris/widgets/TextView";

describe("Drawer", function() {

  let client, drawer;

  beforeEach(function() {
    client = new ClientStub();
    global.tabris = {
      on: () => {},
      _proxies: new ProxyStore(),
      _notify: (cid, event, param) => tabris._proxies.find(cid)._trigger(event, param)
    };
    global.tabris._nativeBridge = new NativeBridge(client);
    drawer = new Drawer({background: "#ff0000"});
  });

  describe("create", function() {

    it("creates Drawer", function() {
      expect(client.calls({op: "create", type: "tabris.Drawer"}).length).to.equal(1);
    });

  });

  describe("instance: ", function() {

    beforeEach(function() {
      client.resetCalls();
    });

    describe("when a child is appended", function() {

      let child;

      beforeEach(function() {
        child = new TextView();
        client.resetCalls();
        drawer.append(child);
      });

      it("child's parent is set to the drawer", function() {
        let call = client.calls({op: "set", id: child.cid})[0];
        expect(call.properties.parent).to.eql(drawer.cid);
      });

    });

    describe("open", function() {

      it("CALLs open", function() {
        drawer.open();
        expect(client.calls({op: "call", id: drawer.cid})[0].method).to.equal("open");
      });

    });

    describe("close", function() {

      it("CALLs close", function() {
        drawer.close();
        expect(client.calls({op: "call", id: drawer.cid})[0].method).to.equal("close");
      });

    });

    describe("dispose", function() {

      beforeEach(function() {
        drawer.dispose();
      });

      it("disposes drawer", function() {
        expect(client.calls({op: "destroy", id: drawer.cid}).length).to.equal(1);
      });

    });

  });

});
