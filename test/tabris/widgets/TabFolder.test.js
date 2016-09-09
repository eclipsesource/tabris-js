import {expect, stub, spy, restore} from "../../test";
import NativeBridgeSpy from "../NativeBridgeSpy";
import Tab from "../../../src/tabris/widgets/Tab";
import TabFolder from "../../../src/tabris/widgets/TabFolder";
import Composite from "../../../src/tabris/widgets/Composite";
import ProxyStore from "../../../src/tabris/ProxyStore";
import NativeBridge from "../../../src/tabris/NativeBridge";

describe("TabFolder", function() {

  let nativeBridge, tabFolder, parent;

  beforeEach(function() {
    nativeBridge = new NativeBridgeSpy();
    global.tabris = {
      on: () => {},
      _proxies: new ProxyStore(),
      _notify: (cid, event, param) => tabris._proxies.find(cid)._trigger(event, param)
    };
    global.tabris._nativeBridge = new NativeBridge(nativeBridge);
    parent = new Composite();
    nativeBridge.resetCalls();
    tabFolder = new TabFolder().appendTo(parent);
  });

  afterEach(restore);

  it("children list is empty", function() {
    expect(tabFolder.children().toArray()).to.eql([]);
  });

  it("paging is false", function() {
    expect(tabFolder.get("paging")).to.equal(false);
  });

  it("returns initial property values", function() {
    expect(tabFolder.get("paging")).to.equal(false);
  });

  describe("when a Tab is appended", function() {

    var tab, create;

    beforeEach(function() {
      nativeBridge.resetCalls();
      tab = new Tab({
        title: "foo",
        image: {src: "bar"},
        selectedImage: {src: "selectedBar"},
        badge: "1",
        background: "#010203",
        visible: false
      });
      create = nativeBridge.calls({op: "create"})[0];
      tab.appendTo(tabFolder);
    });

    it("sets the tabs's parent", function() {
      let call = nativeBridge.calls({op: "set", id: create.id})[0];
      expect(call.properties.parent).to.equal(tabFolder.cid);
    });

    it("getter gets tab properties from cache", function() {
      tab.set({title: "foo", "badge": "bar", image: "foobar.jpg", selectedImage: "selectedFoobar.jpg"});

      expect(tab.get("title")).to.equal("foo");
      expect(tab.get("badge")).to.equal("bar");
      expect(tab.get("image")).to.eql({src: "foobar.jpg"});
      expect(tab.get("selectedImage")).to.eql({src: "selectedFoobar.jpg"});
    });

    it("children list contains only the tab", function() {
      expect(tabFolder.children().toArray()).to.eql([tab]);
    });

    it("find list contains only the tab", function() {
      expect(tabFolder.find().toArray()).to.eql([tab]);
    });

    it("parent find list contains only the TabFolder and tab", function() {
      expect(tabFolder.parent().find().toArray()).to.eql([tabFolder, tab]);
    });

    it("parent childrens children list contains only the tab", function() {
      expect(tabFolder.parent().children().children().toArray()).to.eql([tab]);
    });

    it("children can be filtered with id selector", function() {
      let tab2 = new Tab({id: "foo"}).appendTo(tabFolder);
      expect(tabFolder.children("#foo").toArray()).to.eql([tab2]);
    });

    it("find list can be filtered with id selector", function() {
      let tab2 = new Tab({id: "foo"}).appendTo(tabFolder);
      expect(tabFolder.parent().find("#foo").toArray()).to.eql([tab2]);
    });

    describe("and the Tab is disposed", function() {

      beforeEach(function() {
        nativeBridge.resetCalls();
        tab.dispose();
      });

      it("then destroys the tab", function() {
        expect(nativeBridge.calls({op: "destroy", id: tab.cid})[0]).to.be.ok;
      });

    });

    describe("and the TabFolder is disposed", function() {

      beforeEach(function() {
        tabFolder.dispose();
      });

      it("it disposes the Tab", function() {
        expect(tab.isDisposed()).to.equal(true);
      });

    });

  });

  describe("when paging is set", function() {

    beforeEach(function() {
      tabFolder.set("paging", true);
    });

    it("sets the 'paging' property", function() {
      let setOp = nativeBridge.calls({id: tabFolder.cid, op: "create"})[0];
      expect(setOp.properties.paging).to.eql(true);
    });

    it("getter reflects change", function() {
      expect(tabFolder.get("paging")).to.equal(true);
    });

  });

  describe("selection property:", function() {

    let tab;

    beforeEach(function() {
      tab = new Tab().appendTo(tabFolder);
    });

    it("Setting a Tab SETs tab id", function() {
      tabFolder.set("selection", tab);

      let setCall = nativeBridge.calls({op: "set", id: tabFolder.cid})[0];
      expect(setCall.properties.selection).to.equal(tab.cid);
    });

    it("Ignores setting null with warning", function() {
      spy(console, "warn");

      tabFolder.set("selection", null);

      let calls = nativeBridge.calls({op: "set", id: tabFolder.cid});
      expect(calls.length).to.equal(0);
      expect(console.warn).to.have.been.calledWith("Can not set TabFolder selection to null");
    });

    it("Ignores setting disposed tab with warning", function() {
      spy(console, "warn");
      tab.dispose();

      tabFolder.set("selection", tab);

      let calls = nativeBridge.calls({op: "set", id: tabFolder.cid});
      expect(calls.length).to.equal(0);
      expect(console.warn).to.have.been.calledWith("Can not set TabFolder selection to Tab");
    });

    it("Ignores setting non tab", function() {
      spy(console, "warn");

      tabFolder.set("selection", "foo");

      let calls = nativeBridge.calls({op: "set", id: tabFolder.cid});
      expect(calls.length).to.equal(0);
      expect(console.warn).to.have.been.calledWith("Can not set TabFolder selection to foo");
    });

    it("Get returns Tab", function() {
      stub(nativeBridge, "get").returns(tab.cid);

      expect(tabFolder.get("selection")).to.equal(tab);
    });

    it("Get returns null", function() {
      expect(tabFolder.get("selection")).to.be.null;
    });

    it("supports native event change:selection", function() {
      let listener = spy();
      tabFolder.on("change:selection", listener);

      tabris._notify(tabFolder.cid, "select", {selection: tab.cid});

      expect(listener).to.have.been.calledOnce;
      expect(listener.firstCall).to.have.been.calledWith(tabFolder, tab, {});
    });

    it("supports native event select", function() {
      let listener = spy();
      tabFolder.on("select", listener);

      tabris._notify(tabFolder.cid, "select", {selection: tab.cid});

      expect(listener).to.have.been.calledOnce;
      expect(listener.firstCall).to.have.been.calledWith(tabFolder, tab, {});
    });

  });

  describe("tabBarLocation property", function() {

    beforeEach(function() {
      nativeBridge.resetCalls();
    });

    it("passes property to client", function() {
      tabFolder = new TabFolder({tabBarLocation: "top"});

      let properties = nativeBridge.calls({id: tabFolder.cid, op: "create"})[0].properties;
      expect(properties.tabBarLocation).to.equal("top");
    });

    it("property is cached", function() {
      spy(nativeBridge, "get");
      tabFolder = new TabFolder({tabBarLocation: "top"});

      let result = tabFolder.get("tabBarLocation");

      expect(nativeBridge.get).to.have.not.been.called;
      expect(result).to.equal("top");
    });

    it("sets value tabBarLocation 'top'", function() {
      tabFolder = new TabFolder({tabBarLocation: "top"});

      let properties = nativeBridge.calls({id: tabFolder.cid, op: "create"})[0].properties;
      expect(properties.tabBarLocation).to.eql("top");
    });

    it("sets tabBarLocation 'bottom'", function() {
      tabFolder = new TabFolder({tabBarLocation: "bottom"});

      let properties = nativeBridge.calls({id: tabFolder.cid, op: "create"})[0].properties;
      expect(properties.tabBarLocation).to.eql("bottom");
    });

    it("sets tabBarLocation 'hidden'", function() {
      tabFolder = new TabFolder({tabBarLocation: "hidden"});

      let properties = nativeBridge.calls({id: tabFolder.cid, op: "create"})[0].properties;
      expect(properties.tabBarLocation).to.eql("hidden");
    });

    it("sets tabBarLocation 'auto'", function() {
      tabFolder = new TabFolder({tabBarLocation: "auto"});

      let properties = nativeBridge.calls({id: tabFolder.cid, op: "create"})[0].properties;
      expect(properties.tabBarLocation).to.eql("auto");
    });

  });

});
