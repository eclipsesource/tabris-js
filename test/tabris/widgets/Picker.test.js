import {expect, stub, spy, restore} from "../../test";
import ProxyStore from "../../../src/tabris/ProxyStore";
import NativeBridge from "../../../src/tabris/NativeBridge";
import NativeBridgeSpy from "../NativeBridgeSpy";
import Picker from "../../../src/tabris/widgets/Picker";

describe("Picker", function() {

  let nativeBridge, picker;

  beforeEach(function() {
    nativeBridge = new NativeBridgeSpy();
    global.tabris = {
      on: () => {},
      _proxies: new ProxyStore(),
      _notify: (cid, event, param) => tabris._proxies.find(cid)._trigger(event, param)
    };
    global.tabris._nativeBridge = new NativeBridge(nativeBridge);
    picker = new Picker();
  });

  afterEach(restore);

  describe("creation", function() {

    it("creates picker", function() {
      expect(nativeBridge.calls({op: "create"})[0].type).to.eql("tabris.Picker");
    });

    it("initializes selectionIndex", function() {
      expect(nativeBridge.calls({op: "create"})[0].properties).to.eql({selectionIndex: 0});
    });

  });

  describe("events:", function() {

    let listener;
    let checkEvent = function(value) {
      expect(listener).to.have.been.calledOnce;
      if (arguments.length > 0) {
        expect(listener).to.have.been.calledWith(picker, value, arguments[1] || {});
      } else {
        expect(listener).to.have.been.calledWith(picker, {});
        expect(listener.calls.argsFor(0)[1]).to.eql({});
      }
    };
    let checkListen = function(event) {
      let listen = nativeBridge.calls({op: "listen", id: picker.cid});
      expect(listen.length).to.equal(1);
      expect(listen[0].event).to.equal(event);
      expect(listen[0].listen).to.equal(true);
    };

    beforeEach(function() {
      listener = spy();
    });

    it("select", function() {
      picker.on("select", listener);
      picker.set("items", ["foo", "bar"]);

      tabris._notify(picker.cid, "select", {selectionIndex: 1});

      checkEvent("bar", {index: 1});
      checkListen("select");
    });

    it("change:selection on interactive change", function() {
      picker.on("change:selection", listener);
      picker.set("items", ["foo", "bar"]);

      tabris._notify(picker.cid, "select", {selectionIndex: 1});

      checkEvent("bar", {index: 1});
      checkListen("select");
    });

    it("change:selection on programmatic change", function() {
      picker.on("change:selection", listener);
      picker.set("items", ["foo", "bar"]);

      picker.set("selection", "foo", {custom: 23});

      expect(listener).to.have.been.calledWith(picker, "foo", {custom: 23, index: 0});
      expect(listener).to.have.been.calledOnce;
    });

    it("change:selectionIndex", function() {
      picker.on("change:selectionIndex", listener);

      tabris._notify(picker.cid, "select", {selectionIndex: 23});

      checkEvent(23);
      checkListen("select");
    });

  });

  describe("properties:", function() {

    beforeEach(function() {
      nativeBridge.resetCalls();
    });

    describe("items", function() {

      it("initial value is empty array", function() {
        expect(picker.get("items")).to.eql([]);
      });

      it("initial value is a safe copy", function() {
        picker.get("items").push(23);

        expect(picker.get("items")).to.eql([]);
      });

      it("converts null to empty array", function() {
        expect(picker.set("items", null).get("items")).to.eql([]);
      });

      it("set SETs items property", function() {
        picker.set("items", ["a", "b", "c"]);

        let call = nativeBridge.calls({op: "set", id: picker.cid})[0];
        expect(call.properties).to.eql({items: ["a", "b", "c"]});
      });

      it("get does not GET from client", function() {
        picker.get("items");

        expect(nativeBridge.calls({op: "get", id: picker.cid}).length).to.equal(0);
      });

    });

    describe("itemText", function() {

      it("initial value is function", function() {
        expect(picker.get("itemText")).to.be.a("function");
      });

      it("initial function translates to string", function() {
        let fn = picker.get("itemText");

        expect(fn("foo")).to.equal("foo");
        expect(fn(23)).to.equal("23");
        expect(fn(null)).to.equal("");
        expect(fn()).to.equal("");
      });

      it("does not SET property on client", function() {
        picker.set("itemText", function(item) { return item.name; });

        expect(nativeBridge.calls({op: "set", id: picker.cid}).length).to.equal(0);
      });

    });

    describe("selectionIndex", function() {

      it("set SETs selectionIndex", function() {
        picker.set("selectionIndex", 23);

        expect(nativeBridge.calls({op: "set", id: picker.cid})[0].properties).to.eql({selectionIndex: 23});
      });

    });

    it("get GETs selectionIndex", function() {
      stub(nativeBridge, "get").returns(23);

      expect(picker.get("selectionIndex")).to.equal(23);
      expect(nativeBridge.get).to.have.been.calledWith(picker.cid, "selectionIndex");
    });

    describe("selection", function() {

      it("get returns items entry", function() {
        picker.set("items", ["foo", "bar"]);
        stub(nativeBridge, "get").returns(1);

        expect(picker.get("selection")).to.equal("bar");
      });

      it("set SETs selectionIndex", function() {
        picker.set("items", ["foo", "bar"]);

        picker.set("selection", "bar");

        expect(nativeBridge.calls({op: "set", id: picker.cid})[0].properties.selectionIndex).to.equal(1);
      });

    });

    it("set together with items SETs selectionIndex", function() {
      picker.set({selection: "bar", items: ["foo", "bar"]});
      expect(nativeBridge.calls({op: "set", id: picker.cid})[0].properties).to.eql({
        selectionIndex: 1,
        items: ["foo", "bar"]
      });
    });

    it("set with unknown value prints warning", function() {
      spy(console, "warn");
      picker.set({selection: "bar2"});

      expect(nativeBridge.calls({op: "set", id: picker.cid}).length).to.equal(0);
      expect(console.warn).to.have.been.calledWith("Could not set picker selection bar2: item not found");
    });

  });

});
