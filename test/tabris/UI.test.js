import {expect, spy, restore} from "../test";
import Page from "../../src/tabris/widgets/Page";
import ProxyStore from "../../src/tabris/ProxyStore";
import NativeBridge from "../../src/tabris/NativeBridge";
import NativeBridgeSpy from "./NativeBridgeSpy";
import UI from "../../src/tabris/UI";

describe("UI", function() {

  let nativeBridge;
  let ui;
  let shellId;

  beforeEach(function() {
    nativeBridge = new NativeBridgeSpy();
    global.tabris = {
      on: () => {},
      _notify: (cid, event, param) => tabris._proxies.find(cid)._trigger(event, param),
      _proxies: new ProxyStore()
    };
    global.tabris._nativeBridge = new NativeBridge(nativeBridge);
    ui = new UI();
  });

  afterEach(restore);

  describe("creation", function() {

    it("creates Display, Shell, and tabris UI", function() {
      let createCalls = nativeBridge.calls({op: "create"});
      expect(createCalls[0].type).to.equal("rwt.widgets.Display");
      expect(createCalls[1].type).to.equal("rwt.widgets.Shell");
      expect(createCalls[2].type).to.equal("tabris.UI");
    });

    it("created Shell is active, visible, and maximized", function() {
      let shellCreate = nativeBridge.calls({op: "create", type: "rwt.widgets.Shell"})[0];
      expect(shellCreate.properties.active).to.equal(true);
      expect(shellCreate.properties.visible).to.equal(true);
      expect(shellCreate.properties.mode).to.equal("maximized");
    });

    it("created tabris UI refers to Shell", function() {
      let shellCreate = nativeBridge.calls({op: "create", type: "rwt.widgets.Shell"})[0];
      let tabrisUiCreate = nativeBridge.calls({op: "create", type: "tabris.UI"})[0];
      expect(tabrisUiCreate.properties.shell).to.equal(shellCreate.id);
    });

    it("listens on tabris UI ShowPreviousPage event", function() {
      expect(nativeBridge.calls({op: "listen", id: ui.cid, event: "ShowPreviousPage"}).length).to.equal(1);
    });

  });

  describe("instance", function() {

    beforeEach(function() {
      tabris.ui = ui;
      shellId = nativeBridge.calls({op: "create", type: "rwt.widgets.Shell"})[0].id;
      nativeBridge.resetCalls();
    });

    afterEach(function() {
      delete tabris.ui;
    });

    describe("when a Close event is received for the Shell", function() {

      beforeEach(function() {
        tabris._notify(shellId, "Close", {});
      });

      it("sends a Shell destroy", function() {
        // See https://github.com/eclipsesource/tabris-js/issues/28
        expect(nativeBridge.calls({id: shellId, op: "destroy"}).length).to.equal(1);
      });

    });

    ["light", "dark", "default"].forEach((value) => {

      it("sets win_toolbarTheme to valid value", function() {
        ui.set("win_toolbarTheme", value);

        let call = nativeBridge.calls({op: "set"})[0];
        expect(call.properties.win_toolbarTheme).to.equal(value);
      });

    });

    it("ignores setting win_toolbarTheme to invalid value", function() {
      spy(console, "warn");
      ui.set("win_toolbarTheme", "foo");

      expect(nativeBridge.calls({op: "set"}).length).to.equal(0);
    });

    it("returns win_toolbarTheme default value", function() {
      expect(ui.get("win_toolbarTheme")).to.equal("default");
    });

    describe("with a page", function() {

      let page;

      beforeEach(function() {
        page = new Page({title: "Foo", topLevel: true});
        ui.set("activePage", page);
        spy(page, "close");
        nativeBridge.resetCalls();
      });

      it("fails when closing the single page", function() {
        expect(() => tabris._notify(ui.cid, "ShowPreviousPage", {})).to.throw(/Cannot close the last page/);
      });

      it("has Page in children", function() {
        expect(ui.children("Page")[0]).to.equal(page);
      });

      it("does not have _Page in children", function() {
        expect(ui.children("_Page").length).to.equal(0);
      });

    });

    describe("with multiple pages,", function() {

      let topLevelPage1, topLevelPage2, page1, page2, page3;

      beforeEach(function() {
        topLevelPage1 = new Page({title: "Top-level Page 1", topLevel: true});
        topLevelPage2 = new Page({title: "Top-level Page 2", topLevel: true});
        page1 = new Page({title: "Page 1"});
        page2 = new Page({title: "Page 2"});
        page3 = new Page({title: "Page 3"});
      });

      it("setting 'activePage' fails with widgets other than Page", function() {
        expect(() => {
          ui.set("activePage", new tabris.Button());
        }).to.throw();
        expect(nativeBridge.calls({op: "set", id: ui.cid}).length).to.equal(0);
      });

      it("setting 'activePage' triggers 'appear' and 'disappear' events on pages", function() {
        ui.set("activePage", topLevelPage1);
        spy(topLevelPage1, "trigger");
        spy(topLevelPage2, "trigger");

        ui.set("activePage", topLevelPage2);

        expect(topLevelPage1.trigger).to.have.been.calledOnce;
        expect(topLevelPage1.trigger).to.have.been.calledWith("disappear", topLevelPage1);
        expect(topLevelPage2.trigger).to.have.been.calledOnce;
        expect(topLevelPage2.trigger).to.have.been.calledWith("appear", topLevelPage2);
      });

      it("setting 'activePage' issues a set operation", function() {
        ui.set("activePage", topLevelPage1);
        let setCall = nativeBridge.calls({op: "set", id: ui.cid}).pop();
        expect(setCall.properties.activePage).to.equal(topLevelPage1._page.cid);
      });

      it("getting 'activePage' returns last set active page", function() {
        ui.set("activePage", topLevelPage1);
        ui.set("activePage", topLevelPage2);

        expect(ui.get("activePage")).to.equal(topLevelPage2);
      });

      // OPENING PAGES

      it("when a page on stack is opened, closes pages stacked upon it", function() {
        topLevelPage1.open();
        page1.open();
        page2.open();
        page3.open();

        page1.open();

        expect(page2.isDisposed()).to.equal(true);
        expect(page3.isDisposed()).to.equal(true);
      });

      it("fails when a page is opened without a top-level page", function() {
        expect(() => {
          page1.open();
        }).to.throw();
      });

      it("when a top-level page on stack is opened, closes all stacked pages", function() {
        topLevelPage1.open();
        page1.open();
        page2.open();

        topLevelPage1.open();

        expect(page1.isDisposed()).to.equal(true);
        expect(page2.isDisposed()).to.equal(true);
      });

      it("when lower top-level page on stack is opened, closes all stacked pages", function() {
        topLevelPage1.open();
        topLevelPage2.open();
        page1.open();
        page2.open();

        topLevelPage1.open();

        expect(page1.isDisposed()).to.equal(true);
        expect(page2.isDisposed()).to.equal(true);
        expect(topLevelPage2.isDisposed()).to.equal(false);
      });

      it("when a top-level page on stack is opened, other top-level pages remain on stack", function() {
        topLevelPage1.open();
        topLevelPage2.open();

        topLevelPage1.open();
        topLevelPage1.close();

        expect(tabris.ui.get("activePage")).to.equal(topLevelPage2);
      });

      it("when an off-stack top-level page is opened, closes all stacked pages", function() {
        topLevelPage1.open();
        page1.open();
        page2.open();

        topLevelPage2.open();

        expect(page1.isDisposed()).to.equal(true);
        expect(page2.isDisposed()).to.equal(true);
        expect(topLevelPage1.isDisposed()).to.equal(false);
      });

      it("when an off-stack top-level page is opened, sets activePage *before* disposing pages", function() {
        // Clients can fail when the active page is disposed before it is replaced
        topLevelPage1.open();
        page1.open();
        page1.on("dispose", function() {
          expect(tabris.ui.get("activePage")).to.equal(topLevelPage2);
        });

        topLevelPage2.open();
      });

      it("when an off-stack page is opened, does not close stacked pages", function() {
        topLevelPage1.open();
        page1.open();
        page2.open();

        page3.open();

        expect(page1.isDisposed()).to.equal(false);
        expect(page2.isDisposed()).to.equal(false);
      });

      // CLOSING PAGES

      it("when the active page is closed, restores last active page", function() {
        topLevelPage1.open();
        page2.open();
        page3.open();

        page3.close();

        let lastSetCall = nativeBridge.calls({op: "set", id: ui.cid}).pop();
        expect(lastSetCall.properties.activePage).to.equal(page2._page.cid);
        expect(ui.get("activePage")).to.equal(page2);
      });

      it("when the active page is closed, triggers 'appear' and 'disappear' events on pages", function() {
        let log = [];
        topLevelPage1.open();
        page1.open();
        page2.open();
        page1.on("appear", function() { log.push("page1 appear"); });
        page2.on("disappear", function() { log.push("page2 disappear"); });

        page2.close();

        expect(log).to.eql(["page2 disappear", "page1 appear"]);
      });

      it("when an off-stack page is closed, leave the stack unchanged", function() {
        topLevelPage1.open();
        page1.open();
        page2.open();

        page3.close();

        expect(ui.get("activePage")).to.equal(page2);
      });

      it("when an off-stack top-level page is closed, leave the stack unchanged", function() {
        topLevelPage1.open();
        page1.open();
        page2.open();

        topLevelPage2.close();

        expect(ui.get("activePage")).to.equal(page2);
      });

      it("when a page on stack is closed, closes pages stacked upon it", function() {
        topLevelPage1.open();
        page1.open();
        page2.open();
        page3.open();

        page1.close();

        expect(page2.isDisposed()).to.equal(true);
        expect(page3.isDisposed()).to.equal(true);
      });

      it("when a top-level page on stack is closed, closes pages stacked upon it", function() {
        topLevelPage1.open();
        topLevelPage2.open();
        page1.open();
        page2.open();

        topLevelPage2.close();

        expect(page1.isDisposed()).to.equal(true);
        expect(page2.isDisposed()).to.equal(true);
        expect(ui.get("activePage")).to.equal(topLevelPage1);
      });

      it("when a top-level page on stack is closed, other top-level pages remain on stack", function() {
        topLevelPage1.open();
        topLevelPage2.open();

        topLevelPage1.close();

        expect(tabris.ui.get("activePage")).to.equal(topLevelPage2);
      });

      it("when a lower top-level page on stack is closed, does not close stacked pages", function() {
        topLevelPage1.open();
        topLevelPage2.open();
        page1.open();
        page2.open();

        topLevelPage1.close();

        expect(page1.isDisposed()).to.equal(false);
        expect(page2.isDisposed()).to.equal(false);
        expect(ui.get("activePage")).to.equal(page2);
      });

      it("when a page on stack is closed, sets activePage *before* disposing pages", function() {
        // Clients can fail when the active page is disposed before it is replaced
        topLevelPage1.open();
        page1.open();
        page2.open();
        page2.on("dispose", function() {
          expect(tabris.ui.get("activePage")).to.equal(page1);
        });

        page2.close();
      });

      it("fails when closing the last page", function() {
        topLevelPage1.open();

        expect(() => {
          topLevelPage1.close();
        }).to.throw("Cannot close the last page");
      });

    });

    it("ShowPreviousPage does not fail without a page", function() {
      expect(() => {
        tabris._notify(ui.cid, "ShowPreviousPage", {});
      }).to.not.throw();
    });

  });

});
