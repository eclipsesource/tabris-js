import {expect, spy, stub, restore} from "../../test";
import ProxyStore from "../../../src/tabris/ProxyStore";
import NativeBridge from "../../../src/tabris/NativeBridge";
import NativeBridgeSpy from "../NativeBridgeSpy";
import ScrollView from "../../../src/tabris/widgets/ScrollView";
import Composite from "../../../src/tabris/widgets/Composite";

describe("ScrollView", function() {

  let nativeBridge;

  beforeEach(function() {
    nativeBridge = new NativeBridgeSpy();
    global.tabris = {
      on: () => {},
      _proxies: new ProxyStore()
    };
    global.tabris._nativeBridge = new NativeBridge(nativeBridge);
  });

  afterEach(restore);

  describe("when a ScrollView is created", function() {
    let scrollView, createCalls;

    beforeEach(function() {
      scrollView = new ScrollView();
      createCalls = nativeBridge.calls({op: "create"});
    });

    it("creates a vertical ScrolledComposite", function() {
      expect(createCalls[0].type).to.equal("rwt.widgets.ScrolledComposite");
      expect(createCalls[0].properties.style).to.eql(["V_SCROLL"]);
    });

    it("creates a vertical ScrollBar", function() {
      expect(createCalls[1].type).to.equal("rwt.widgets.ScrollBar");
      expect(createCalls[1].properties.parent).to.equal(createCalls[0].id);
      expect(createCalls[1].properties.style).to.eql(["VERTICAL"]);
    });

    it("creates a Composite", function() {
      expect(createCalls[2].type).to.equal("tabris.Composite");
      expect(createCalls[2].properties.parent).to.equal(createCalls[0].id);
    });

    it("sets the Composite as content", function() {
      let setCall = nativeBridge.calls({op: "set", id: createCalls[0].id})[0];
      expect(setCall.properties).to.eql({content: createCalls[2].id});
    });

    describe("when a child is appended", function() {
      let result, child;

      beforeEach(function() {
        child = new Composite();
        nativeBridge.resetCalls();
        result = scrollView.append(child);
      });

      it("sets child's parent to the inner composite", function() {
        let call = nativeBridge.calls({op: "set", id: child.cid})[0];
        expect(call.properties.parent).to.equal(scrollView._composite.cid);
      });

      it("returns self to allow chaining", function() {
        expect(result).to.equal(scrollView);
      });

    });

    describe("when a Scroll listener is added", function() {
      let listener;
      let scrollBar;

      beforeEach(function() {
        listener = spy();
        scrollBar = tabris._proxies.find(createCalls[1].id);
        scrollView.on("scroll", listener);
        stub(nativeBridge, "get", function(id, property) {
          if (id === scrollView.cid && property === "origin") {
            return [23, 42];
          }
        });
      });

      it("is notified on ScrollBar change", function() {
        scrollBar.trigger("Selection", {});
        expect(listener).to.have.been.calledOnce;
        expect(listener).to.have.been.calledWith(scrollView, {x: 23, y: 42});
      });

      describe("when another listener is added", function() {

        beforeEach(function() {
          scrollView.on("scroll", spy());
        });

        it("is notified on ScrollBar change once", function() {
          scrollBar.trigger("Selection", {});
          expect(listener).to.have.been.calledOnce;
        });

      });

      describe("when the listener is removed", function() {

        beforeEach(function() {
          scrollView.off("scroll", listener);
        });

        it("is not notified on ScrollBar change anymore", function() {
          scrollBar.trigger("Selection", {});
          expect(listener).not.to.have.been.called;
        });

      });

    });

    describe("appending a widget", function() {
      let child;

      beforeEach(function() {
        child = new Composite();
        nativeBridge.resetCalls();
        scrollView.append(child);
      });

      it("uses inner composite in 'set'", function() {
        let call = nativeBridge.calls({op: "set", id: child.cid})[0];
        expect(call.properties.parent).to.equal(scrollView._composite.cid);
      });

    });

  });

  describe("when created with direction 'vertical'", function() {

    let scrollView, createCalls;

    beforeEach(function() {
      scrollView = new ScrollView({direction: "vertical"});
      createCalls = nativeBridge.calls({op: "create"});
      nativeBridge.resetCalls();
    });

    it("creates a vertical ScrolledComposite", function() {
      expect(createCalls[0].properties.style).to.eql(["V_SCROLL"]);
    });

    it("creates a vertical ScrollBar", function() {
      expect(createCalls[1].properties.style).to.eql(["VERTICAL"]);
    });

    it("direction is 'vertical'", function() {
      expect(scrollView.get("direction")).to.eql("vertical");
    });

    it("scrollY is taken from native, scrollX is 0", function() {
      stub(nativeBridge, "get").returns([23, 42]);
      expect(scrollView.get("scrollX")).to.equal(0);
      expect(scrollView.get("scrollY")).to.equal(42);
    });

    it("scrollY can be set", function() {
      scrollView.set("scrollY", 23);

      let setCalls = nativeBridge.calls({id: scrollView.cid, op: "set"});

      expect(setCalls[0].properties.origin).to.eql([0, 23]);
    });

    it("ignores setting scrollX", function() {
      scrollView.set("scrollX", 23);

      let setCalls = nativeBridge.calls({id: scrollView.cid, op: "set"});

      expect(setCalls.length).to.equal(0);
    });

  });

  describe("when created with direction 'horizontal'", function() {

    let scrollView, createCalls;

    beforeEach(function() {
      scrollView = new ScrollView({direction: "horizontal"});
      createCalls = nativeBridge.calls({op: "create"});
      nativeBridge.resetCalls();
    });

    it("creates a horizontal ScrolledComposite", function() {
      expect(createCalls[0].properties.style).to.eql(["H_SCROLL"]);
    });

    it("creates a horizontal ScrollBar", function() {
      expect(createCalls[1].properties.style).to.eql(["HORIZONTAL"]);
    });

    it("direction is 'horizontal'", function() {
      expect(scrollView.get("direction")).to.equal("horizontal");
    });

    it("scrollX is taken from native, scrollY is 0", function() {
      stub(nativeBridge, "get").returns([23, 42]);
      expect(scrollView.get("scrollX")).to.equal(23);
      expect(scrollView.get("scrollY")).to.equal(0);
    });

    it("scrollX can be set", function() {
      scrollView.set("scrollX", 23);

      let setCalls = nativeBridge.calls({id: scrollView.cid, op: "set"});

      expect(setCalls[0].properties.origin).to.eql([23, 0]);
    });

    it("ignores setting scrollY", function() {
      scrollView.set("scrollY", 23);

      let setCalls = nativeBridge.calls({id: scrollView.cid, op: "set"});

      expect(setCalls.length).to.equal(0);
    });

  });

  describe("when created without direction", function() {

    let scrollView, createCalls;

    beforeEach(function() {
      scrollView = new ScrollView();
      createCalls = nativeBridge.calls({op: "create"});
    });

    it("creates a vertical ScrolledComposite", function() {
      expect(createCalls[0].properties.style).to.eql(["V_SCROLL"]);
    });

    it("creates a vertical ScrollBar", function() {
      expect(createCalls[1].properties.style).to.eql(["VERTICAL"]);
    });

    it("direction is 'vertical'", function() {
      expect(scrollView.get("direction")).to.eql("vertical");
    });

  });

});
