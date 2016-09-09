import {expect, spy, restore} from "../../test";
import ProxyStore from "../../../src/tabris/ProxyStore";
import NativeBridge from "../../../src/tabris/NativeBridge";
import NativeBridgeSpy from "../NativeBridgeSpy";
import Page from "../../../src/tabris/widgets/Page";
import Composite from "../../../src/tabris/widgets/Composite";
import UI from "../../../src/tabris/UI";

describe("Page", function() {

  let nativeBridge;
  let page;

  beforeEach(function() {
    nativeBridge = new NativeBridgeSpy();
    global.tabris = {
      on: () => {},
      _proxies: new ProxyStore(),
      _notify: (cid, event, param) => tabris._proxies.find(cid)._trigger(event, param)
    };
    global.tabris._nativeBridge = new NativeBridge(nativeBridge);
    tabris.ui = new UI();
    spy(tabris.ui, "set");
    nativeBridge.resetCalls();
  });

  afterEach(function() {
    restore();
    delete tabris.ui;
  });

  describe("create", function() {

    beforeEach(function() {
      page = new Page({
        title: "title",
        image: {src: "image"},
        style: "fullscreen",
        topLevel: true,
        background: "red"
      });
    });

    it("creates a Composite and a Page", function() {
      let createCalls = nativeBridge.calls({op: "create"});
      expect(createCalls.length).to.equal(2);
      expect(createCalls[0].type).to.equal("tabris.Composite");
      expect(createCalls[1].type).to.equal("tabris.Page");
    });

    describe("created Composite", function() {

      let createProps;

      beforeEach(function() {
        let createCall = nativeBridge.calls({op: "create", type: "tabris.Composite"})[0];
        createProps = createCall.properties;
      });

      it("parent is set to shell in create", function() {
        expect(createProps.parent).to.eql(tabris.ui._shell.cid);
      });

      it("is full-size", function() {
        expect(createProps.layoutData).to.eql({left: 0, right: 0, top: 0, bottom: 0});
      });

      it("does not inherit page properties", function() {
        expect(createProps.title).to.be.undefined;
        expect(createProps.image).to.be.undefined;
        expect(createProps.style).to.be.undefined;
        expect(createProps.topLevel).to.be.undefined;
      });

      it("has non-page properties", function() {
        expect(createProps.background).to.eql([255, 0, 0, 255]);
      });

    });

    describe("created Page", function() {

      let properties;

      beforeEach(function() {
        let createCall = nativeBridge.calls({op: "create", type: "tabris.Page"})[0];
        properties = createCall.properties;
      });

      it("parent is set to tabris.UI", function() {
        expect(properties.parent).to.equal(tabris.ui.cid);
      });

      it("control is set to composite", function() {
        expect(properties.control).to.equal(page.cid);
      });

      it("has title, image and topLevel properties", function() {
        expect(properties.title).to.equal("title");
        expect(properties.image).to.eql(["image", null, null, null]);
        expect(properties.style).to.equal("fullscreen");
        expect(properties.topLevel).to.equal(true);
      });

      it("does not inherit non-page properties", function() {
        expect(properties.background).to.be.undefined;
      });

      it("supports getting image property", function() {
        expect(page.get("image")).to.eql({src: "image"});
      });

      it("image property is nullable", function() {
        expect(page.set("image", null).get("image")).to.be.null;
      });

    });

  });

  describe("when created", function() {
    let pageCreateCall;
    let compositeCreateCall;

    beforeEach(function() {
      new Page({topLevel: true}).open(); // prevent error for opening a page without a top-level page
      nativeBridge.resetCalls();
      page = new Page();
      pageCreateCall = nativeBridge.calls({op: "create", type: "tabris.Page"})[0];
      compositeCreateCall = nativeBridge.calls({op: "create", type: "tabris.Composite"})[0];
      nativeBridge.resetCalls();
    });

    it("returns default property values", function() {
      expect(page.get("image")).to.equal(null);
      expect(page.get("title")).to.equal("");
    });

    describe("when a child is appended", function() {
      let child;

      beforeEach(function() {
        child = new Composite();
        nativeBridge.resetCalls();
        page.append(child);
      });

      it("sets child's parent to the composite", function() {
        let call = nativeBridge.calls({op: "set", id: child.cid})[0];
        expect(call.properties.parent).to.eql(compositeCreateCall.id);
      });

    });

    describe("set", function() {

      it("modifies the page", function() {
        page.set("title", "foo");

        let setCalls = nativeBridge.calls({op: "set", id: pageCreateCall.id});
        expect(setCalls.length).to.equal(1);
        expect(setCalls[0].properties.title).to.eql("foo");
      });

      it("modifies the composite", function() {
        page.set("background", "red");

        let setCalls = nativeBridge.calls({op: "set", id: compositeCreateCall.id});
        expect(setCalls.length).to.equal(1);
        expect(setCalls[0].properties.background).to.eql([255, 0, 0, 255]);
      });

    });

    describe("open", function() {

      it("sets active page", function() {
        page.open();

        expect(tabris.ui.set).to.have.been.calledWith("activePage", page);
      });

      it("returns self to allow chaining", function() {
        let result = page.open();

        expect(result).to.equal(page);
      });

    });

    describe("close", function() {

      it("destroys composite and page", function() {
        page.open();

        page.close();

        let destroyCalls = nativeBridge.calls({op: "destroy"});
        // page must be destroyed before composite, see issue 253
        expect(destroyCalls[0].id).to.equal(pageCreateCall.id);
        expect(destroyCalls[1].id).to.equal(compositeCreateCall.id);
      });

    });

    describe("appending a widget", function() {
      let child;

      beforeEach(function() {
        child = new Composite();
        nativeBridge.resetCalls();
        page.append(child);
      });

      it("uses page's composite in 'set'", function() {
        let call = nativeBridge.calls({op: "set", id: child.cid})[0];
        expect(call.properties.parent).to.equal(page.cid);
      });

    });

  });

});
