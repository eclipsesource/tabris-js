import {expect, restore, spy, stub} from "../../test";
import ProxyStore from "../../../src/tabris/ProxyStore";
import ClientStub from "../ClientStub";
import ScrollView from "../../../src/tabris/widgets/ScrollView";
import Composite from "../../../src/tabris/widgets/Composite";
import NativeBridge from "../../../src/tabris/NativeBridge";

describe("ScrollView", function() {

  let client, scrollView;

  let checkListen = function(event) {
    let listen = client.calls({op: "listen", id: scrollView.cid});
    expect(listen.length).to.equal(1);
    expect(listen[0].event).to.equal(event);
    expect(listen[0].listen).to.equal(true);
  };

  beforeEach(function() {
    client = new ClientStub();
    global.tabris = {
      on: () => {},
      _proxies: new ProxyStore(),
      _notify: (cid, event, param) => tabris._proxies.find(cid)._trigger(event, param)
    };
    global.tabris._nativeBridge = new NativeBridge(client);
  });

  afterEach(restore);

  describe("when a ScrollView is created", function() {

    beforeEach(function() {
      scrollView = new ScrollView();
    });

    it("defaults to vertical direction", function() {
      expect(scrollView.direction).to.equal("vertical");
    });

    describe("when a child is appended", function() {

      let result, child;

      beforeEach(function() {
        child = new Composite();
        client.resetCalls();
        result = scrollView.append(child);
      });

      it("sets child's parent to scrollView", function() {
        let call = client.calls({op: "set", id: child.cid})[0];
        expect(call.properties.parent).to.equal(scrollView.cid);
      });

      it("returns self to allow chaining", function() {
        expect(result).to.equal(scrollView);
      });

    });

  });

  describe("when created with direction 'vertical'", function() {

    let createCalls;

    beforeEach(function() {
      scrollView = new ScrollView({direction: "vertical"});
      createCalls = client.calls({op: "create"});
      client.resetCalls();
    });

    it("creates a vertical ScrolledView", function() {
      expect(createCalls[0].properties.direction).to.equal("vertical");
      expect(scrollView.get("direction")).to.equal("vertical");
    });

    it("offsetY is taken from native", function() {
      stub(client, "get").returns(42);
      expect(scrollView.get("offsetY")).to.equal(42);
    });

    it("offsetY can be set", function() {
      scrollView.set("offsetY", 23);

      let setCalls = client.calls({id: scrollView.cid, op: "set"});

      expect(setCalls[0].properties.offsetY).to.equal(23);
    });

    it("fires scroll event", function() {
      let listener = spy();
      scrollView.on("scrollY", listener);

      tabris._notify(scrollView.cid, "scrollY", 42);

      checkListen("scrollY");
      expect(listener).to.have.been.called;
      expect(listener.firstCall.args[0]).to.equal(scrollView);
      expect(listener.firstCall.args[1]).to.equal(42);
    });

    it("fires change:offsetY event", function() {
      let listener = spy();
      scrollView.on("change:offsetY", listener);

      tabris._notify(scrollView.cid, "scrollY", 42);

      checkListen("scrollY");
      expect(listener).to.have.been.called;
      expect(listener.firstCall.args[0]).to.equal(scrollView);
      expect(listener.firstCall.args[1]).to.equal(42);
    });

    it("does not fire change:offsetX event", function() {
      let listener = spy();
      scrollView.on("change:offsetX", listener);

      tabris._notify(scrollView.cid, "scrollY", 42);

      expect(listener).not.to.have.been.called;
    });

  });

  describe("when created with direction 'horizontal'", function() {

    let createCalls;

    beforeEach(function() {
      scrollView = new ScrollView({direction: "horizontal"});
      createCalls = client.calls({op: "create"});
      client.resetCalls();
    });

    it("creates a horizontal ScrollView", function() {
      expect(createCalls[0].properties.direction).to.equal("horizontal");
      expect(scrollView.get("direction")).to.equal("horizontal");
    });

    it("offsetX is taken from native", function() {
      stub(client, "get").returns(23);
      expect(scrollView.get("offsetX")).to.equal(23);
    });

    it("offsetX can be set", function() {
      scrollView.set("offsetX", 23);

      let setCalls = client.calls({id: scrollView.cid, op: "set"});

      expect(setCalls[0].properties.offsetX).to.equal(23);
    });

    it("fires scrollX event", function() {
      let listener = spy();
      scrollView.on("scrollX", listener);

      tabris._notify(scrollView.cid, "scrollX", 42);

      checkListen("scrollX");
      expect(listener).to.have.been.called;
      expect(listener.firstCall.args[0]).to.equal(scrollView);
      expect(listener.firstCall.args[1]).to.equal(42);
    });

    it("fires change:offsetX event", function() {
      let listener = spy();
      scrollView.on("change:offsetX", listener);

      tabris._notify(scrollView.cid, "scrollX", 42);

      checkListen("scrollX");
      expect(listener).to.have.been.called;
      expect(listener.firstCall.args[0]).to.equal(scrollView);
      expect(listener.firstCall.args[1]).to.equal(42);
    });

    it("does not fire change:offsetY event", function() {
      let listener = spy();
      scrollView.on("change:offsetY", listener);

      tabris._notify(scrollView.cid, "scrollX", 43);

      expect(listener).not.to.have.been.called;
    });

  });

  describe("when scrollToX is invoked", function() {

    beforeEach(function() {
      scrollView = new ScrollView();
    });

    it("calls 'scrollToX' on client", function() {
      scrollView.scrollToX(100);

      expect(client.calls({op: "call", id: scrollView.cid})[0].parameters.offsetX).to.equal(100);
    });

  });

  describe("when scrollToY is invoked", function() {

    beforeEach(function() {
      scrollView = new ScrollView();
    });

    it("calls 'scrollToY' on client", function() {
      scrollView.scrollToY(200);

      expect(client.calls({op: "call", id: scrollView.cid})[0].parameters.offsetY).to.equal(200);
    });

  });

});
