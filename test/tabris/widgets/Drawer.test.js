import {expect} from "../../test";
import ProxyStore from "../../../src/tabris/ProxyStore";
import NativeBridge from "../../../src/tabris/NativeBridge";
import NativeBridgeSpy from "../NativeBridgeSpy";
import Drawer from "../../../src/tabris/widgets/Drawer";
import TextView from "../../../src/tabris/widgets/TextView";
import UI from "../../../src/tabris/UI";

describe("Drawer", function() {

  let nativeBridge;
  let drawer;

  beforeEach(function() {
    nativeBridge = new NativeBridgeSpy();
    global.tabris = {
      on: () => {},
      _proxies: new ProxyStore(),
      _notify: (cid, event, param) => tabris._proxies.find(cid)._trigger(event, param)
    };
    global.tabris._nativeBridge = new NativeBridge(nativeBridge);
    tabris.ui = new UI();
    drawer = new Drawer({background: "#ff0000"});
  });

  afterEach(function() {
    delete tabris.ui;
  });

  describe("create", function() {

    it("creates Drawer", function() {
      expect(nativeBridge.calls({op: "create", type: "tabris.Drawer"}).length).to.equal(1);
    });

    it("sets drawer on ui as read-only", function() {
      tabris.ui.drawer = null;
      expect(tabris.ui.drawer).to.equal(drawer);
    });

    it("sets ui as parent", function() {
      expect(drawer.parent()).to.equal(tabris.ui);
      expect(tabris.ui.children("Drawer")[0]).to.equal(drawer);
    });

    it("fails when a drawer already exists", function() {
      expect(() => { new Drawer(); }).to.throw();
      expect(nativeBridge.calls({op: "create", type: "tabris.Drawer"}).length).to.equal(1);
    });

  });

  describe("instance: ", function() {

    beforeEach(function() {
      nativeBridge.resetCalls();
    });

    describe("when a child is appended", function() {
      let child;

      beforeEach(function() {
        child = new TextView();
        nativeBridge.resetCalls();
        drawer.append(child);
      });

      it("child's parent is set to the drawer", function() {
        let call = nativeBridge.calls({op: "set", id: child.cid})[0];
        expect(call.properties.parent).to.eql(drawer.cid);
      });

    });

    describe("open", function() {

      it("CALLs open", function() {
        drawer.open();
        expect(nativeBridge.calls({op: "call", id: drawer.cid})[0].method).to.equal("open");
      });

    });

    describe("close", function() {

      it("CALLs close", function() {
        drawer.close();
        expect(nativeBridge.calls({op: "call", id: drawer.cid})[0].method).to.equal("close");
      });

    });

    describe("dispose", function() {

      beforeEach(function() {
        drawer.dispose();
      });

      it("disposes drawer and composite", function() {
        expect(nativeBridge.calls({op: "destroy", id: drawer.cid}).length).to.equal(1);
        expect(nativeBridge.calls({op: "destroy", id: drawer.cid}).length).to.equal(1);
      });

      it("clear tabris.ui.drawer", function() {
        expect(tabris.ui.drawer).to.be.null;
      });

      it("allows new drawer to be created", function() {
        expect(() => { new Drawer(); }).to.not.throw();
        expect(nativeBridge.calls({op: "create", type: "tabris.Drawer"}).length).to.equal(1);
      });

    });

  });

});
