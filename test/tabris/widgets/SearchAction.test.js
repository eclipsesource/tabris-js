import {expect, spy, restore} from "../../test";
import ProxyStore from "../../../src/tabris/ProxyStore";
import NativeBridge from "../../../src/tabris/NativeBridge";
import NativeBridgeSpy from "../NativeBridgeSpy";
import SearchAction from "../../../src/tabris/widgets/SearchAction";
import UI from "../../../src/tabris/UI";

describe("SearchAction", function() {

  let nativeBridge;

  beforeEach(function() {
    nativeBridge = new NativeBridgeSpy();
    global.tabris = {
      on: () => {},
      _proxies: new ProxyStore(),
      _notify: (cid, event, param) => tabris._proxies.find(cid)._trigger(event, param)
    };
    global.tabris._nativeBridge = new NativeBridge(nativeBridge);
    tabris.ui = new UI();
  });

  afterEach(function() {
    restore();
    delete tabris.ui;
  });

  describe("create", function() {

    let actionCreateCalls;

    beforeEach(function() {
      new SearchAction({title: "Foo", enabled: true});
      actionCreateCalls = nativeBridge.calls({op: "create", type: "tabris.SearchAction"});
    });

    it("creates an action", function() {
      expect(actionCreateCalls.length).to.equal(1);
    });

    it("created action's parent is set to tabris.ui", function() {
      expect(actionCreateCalls[0].properties.parent).to.eql(tabris.ui.cid);
    });

    it("tabris.ui.children has SearchAction", function() {
      expect(tabris.ui.children("SearchAction").length).to.equal(1);
    });

    it("properties are passed to created action", function() {
      expect(actionCreateCalls[0].properties.title).to.eql("Foo");
      expect(actionCreateCalls[0].properties.enabled).to.equal(true);
    });

  });

  describe("set", function() {

    let action;

    beforeEach(function() {
      action = new SearchAction();
      nativeBridge.resetCalls();
    });

    it("translates placement priority to uppercase", function() {
      action.set("placementPriority", "low");

      let call = nativeBridge.calls({op: "set"})[0];
      expect(call.properties.placementPriority).to.equal("low");
    });

  });

  describe("get", function() {

    let action;

    beforeEach(function() {
      action = new SearchAction();
      nativeBridge.resetCalls();
    });

    it("returns cached placementPriority", function() {
      action.set("placementPriority", "low");

      let result = action.get("placementPriority");

      expect(result).to.equal("low");
    });

    it("returns initial values", function() {
      expect(action.get("enabled")).to.equal(true);
      expect(action.get("image")).to.equal(null);
      expect(action.get("title")).to.equal("");
      expect(action.get("visible")).to.equal(true);
      expect(action.get("proposals")).to.eql([]);
      expect(action.get("placementPriority")).to.equal("normal");
    });

  });

  describe("native events", function() {

    let action, listener;

    beforeEach(function() {
      action = new SearchAction();
      listener = spy();
    });

    let checkEvent = function(value) {
      expect(listener).to.have.been.calledOnce;
      if (arguments.length === 1) {
        expect(listener).to.have.been.calledWith(action, value, {});
      } else {
        expect(listener).to.have.been.calledWith(action, {});
      }
    };
    let checkListen = function(event) {
      let listen = nativeBridge.calls({op: "listen", id: action.cid});
      expect(listen.length).to.equal(1);
      expect(listen[0].event).to.equal(event);
      expect(listen[0].listen).to.equal(true);
    };

    it("select", function() {
      action.on("select", listener);
      tabris._notify(action.cid, "select", {});

      checkListen("select");
      checkEvent();
    });

    it("accept", function() {
      action.on("accept", listener);
      tabris._notify(action.cid, "accept", {text: "foo"});

      checkListen("accept");
      checkEvent("foo");
    });

  });

  describe("open", function() {

    let action;

    beforeEach(function() {
      action = new SearchAction();
    });

    it("invokes 'open' call operation on native bridge", function() {
      spy(nativeBridge, "call");

      action.open();

      expect(nativeBridge.call).to.have.been.calledWith(action.cid, "open", {});
    });

    it("returns self to allow chaining", function() {
      let result = action.open();

      expect(result).to.equal(action);
    });

  });

});
