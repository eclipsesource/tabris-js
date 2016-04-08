describe("UI", function() {

  var nativeBridge;
  var ui;
  var shellId;

  beforeEach(function() {
    nativeBridge = new NativeBridgeSpy();
    tabris._reset();
    tabris._init(nativeBridge);
    ui = new tabris._UI();
  });

  describe("creation", function() {

    it("creates Display, Shell, and tabris UI", function() {
      var createCalls = nativeBridge.calls({op: "create"});
      expect(createCalls[0].type).toBe("rwt.widgets.Display");
      expect(createCalls[1].type).toBe("rwt.widgets.Shell");
      expect(createCalls[2].type).toBe("tabris.UI");
    });

    it("created Shell is active, visible, and maximized", function() {
      var shellCreate = nativeBridge.calls({op: "create", type: "rwt.widgets.Shell"})[0];
      expect(shellCreate.properties.active).toBe(true);
      expect(shellCreate.properties.visibility).toBe(true);
      expect(shellCreate.properties.mode).toBe("maximized");
    });

    it("created tabris UI refers to Shell", function() {
      var shellCreate = nativeBridge.calls({op: "create", type: "rwt.widgets.Shell"})[0];
      var tabrisUiCreate = nativeBridge.calls({op: "create", type: "tabris.UI"})[0];
      expect(tabrisUiCreate.properties.shell).toBe(shellCreate.id);
    });

    it("listens on tabris UI ShowPreviousPage event", function() {
      expect(nativeBridge.calls({op: "listen", id: ui.cid, event: "ShowPreviousPage"}).length).toBe(1);
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
        expect(nativeBridge.calls({id: shellId, op: "destroy"}).length).toBe(1);
      });

    });

    ["light", "dark", "default"].forEach(function(value) {

      it("sets win_toolbarTheme to valid value", function() {
        ui.set("win_toolbarTheme", value);

        var call = nativeBridge.calls({op: "set"})[0];
        expect(call.properties.win_toolbarTheme).toBe(value);
      });

    });

    it("ignores setting win_toolbarTheme to invalid value", function() {
      spyOn(console, "warn");
      ui.set("win_toolbarTheme", "foo");

      expect(nativeBridge.calls({op: "set"}).length).toBe(0);
    });

    it("returns win_toolbarTheme default value", function() {
      expect(ui.get("win_toolbarTheme")).toBe("default");
    });

    describe("with a page", function() {

      var page;

      beforeEach(function() {
        page = new tabris.Page({title: "Foo", topLevel: true});
        ui.set("activePage", page);
        spyOn(page, "close");
        nativeBridge.resetCalls();
      });

      it("ShowPreviousPage event closes page", function() {
        tabris._notify(ui.cid, "ShowPreviousPage", {});
        expect(page.close).toHaveBeenCalled();
      });

      it("has Page in children", function() {
        expect(ui.children("Page")[0]).toBe(page);
      });

      it("does not have _Page in children", function() {
        expect(ui.children("_Page").length).toBe(0);
      });

    });

    describe("with multiple pages,", function() {

      var topLevelPage1, topLevelPage2, page1, page2, page3;

      beforeEach(function() {
        topLevelPage1 = new tabris.Page({title: "Top-level Page 1", topLevel: true});
        topLevelPage2 = new tabris.Page({title: "Top-level Page 2", topLevel: true});
        page1 = new tabris.Page({title: "Page 1"});
        page2 = new tabris.Page({title: "Page 2"});
        page3 = new tabris.Page({title: "Page 3"});
      });

      it("setting 'activePage' fails with widgets other than Page", function() {
        expect(function() {
          ui.set("activePage", new tabris.Button());
        }).toThrow();
        expect(nativeBridge.calls({op: "set", id: ui.cid}).length).toBe(0);
      });

      it("setting 'activePage' triggers 'appear' and 'disappear' events on pages", function() {
        ui.set("activePage", topLevelPage1);
        spyOn(topLevelPage1, "trigger");
        spyOn(topLevelPage2, "trigger");

        ui.set("activePage", topLevelPage2);

        expect(topLevelPage1.trigger.calls.argsFor(0)[0]).toBe("disappear");
        expect(topLevelPage1.trigger.calls.argsFor(0)[1]).toBe(topLevelPage1);
        expect(topLevelPage2.trigger.calls.argsFor(0)[0]).toBe("appear");
        expect(topLevelPage2.trigger.calls.argsFor(0)[1]).toBe(topLevelPage2);
      });

      it("setting 'activePage' issues a set operation", function() {
        ui.set("activePage", topLevelPage1);
        var setCall = nativeBridge.calls({op: "set", id: ui.cid}).pop();
        expect(setCall.properties.activePage).toBe(topLevelPage1._page.cid);
      });

      it("getting 'activePage' returns last set active page", function() {
        ui.set("activePage", topLevelPage1);
        ui.set("activePage", topLevelPage2);

        expect(ui.get("activePage")).toBe(topLevelPage2);
      });

      // OPENING PAGES

      it("when a page on stack is opened, closes pages stacked upon it", function() {
        topLevelPage1.open();
        page1.open();
        page2.open();
        page3.open();

        page1.open();

        expect(page2.isDisposed()).toBe(true);
        expect(page3.isDisposed()).toBe(true);
      });

      it("fails when a page is opened without a top-level page", function() {
        expect(function() {
          page1.open();
        }).toThrow();
      });

      it("when a top-level page on stack is opened, closes all stacked pages", function() {
        topLevelPage1.open();
        page1.open();
        page2.open();

        topLevelPage1.open();

        expect(page1.isDisposed()).toBe(true);
        expect(page2.isDisposed()).toBe(true);
      });

      it("when lower top-level page on stack is opened, closes all stacked pages", function() {
        topLevelPage1.open();
        topLevelPage2.open();
        page1.open();
        page2.open();

        topLevelPage1.open();

        expect(page1.isDisposed()).toBe(true);
        expect(page2.isDisposed()).toBe(true);
        expect(topLevelPage2.isDisposed()).toBe(false);
      });

      it("when a top-level page on stack is opened, other top-level pages remain on stack", function() {
        topLevelPage1.open();
        topLevelPage2.open();

        topLevelPage1.open();
        topLevelPage1.close();

        expect(tabris.ui.get("activePage")).toBe(topLevelPage2);
      });

      it("when an off-stack top-level page is opened, closes all stacked pages", function() {
        topLevelPage1.open();
        page1.open();
        page2.open();

        topLevelPage2.open();

        expect(page1.isDisposed()).toBe(true);
        expect(page2.isDisposed()).toBe(true);
        expect(topLevelPage1.isDisposed()).toBe(false);
      });

      it("when an off-stack top-level page is opened, sets activePage *before* disposing pages", function() {
        // Clients can fail when the active page is disposed before it is replaced
        topLevelPage1.open();
        page1.open();
        page1.on("dispose", function() {
          expect(tabris.ui.get("activePage")).toBe(topLevelPage2);
        });

        topLevelPage2.open();
      });

      it("when an off-stack page is opened, does not close stacked pages", function() {
        topLevelPage1.open();
        page1.open();
        page2.open();

        page3.open();

        expect(page1.isDisposed()).toBe(false);
        expect(page2.isDisposed()).toBe(false);
      });

      // CLOSING PAGES

      it("when the active page is closed, restores last active page", function() {
        topLevelPage1.open();
        page2.open();
        page3.open();

        page3.close();

        var lastSetCall = nativeBridge.calls({op: "set", id: ui.cid}).pop();
        expect(lastSetCall.properties.activePage).toBe(page2._page.cid);
        expect(ui.get("activePage")).toBe(page2);
      });

      it("when the active page is closed, triggers 'appear' and 'disappear' events on pages", function() {
        var log = [];
        topLevelPage1.open();
        page1.open();
        page2.open();
        page1.on("appear", function() { log.push("page1 appear"); });
        page2.on("disappear", function() { log.push("page2 disappear"); });

        page2.close();

        expect(log).toEqual(["page2 disappear", "page1 appear"]);
      });

      it("when an off-stack page is closed, leave the stack unchanged", function() {
        topLevelPage1.open();
        page1.open();
        page2.open();

        page3.close();

        expect(ui.get("activePage")).toBe(page2);
      });

      it("when an off-stack top-level page is closed, leave the stack unchanged", function() {
        topLevelPage1.open();
        page1.open();
        page2.open();

        topLevelPage2.close();

        expect(ui.get("activePage")).toBe(page2);
      });

      it("when a page on stack is closed, closes pages stacked upon it", function() {
        topLevelPage1.open();
        page1.open();
        page2.open();
        page3.open();

        page1.close();

        expect(page2.isDisposed()).toBe(true);
        expect(page3.isDisposed()).toBe(true);
      });

      it("when a top-level page on stack is closed, closes pages stacked upon it", function() {
        topLevelPage1.open();
        topLevelPage2.open();
        page1.open();
        page2.open();

        topLevelPage2.close();

        expect(page1.isDisposed()).toBe(true);
        expect(page2.isDisposed()).toBe(true);
        expect(ui.get("activePage")).toBe(topLevelPage1);
      });

      it("when a top-level page on stack is closed, other top-level pages remain on stack", function() {
        topLevelPage1.open();
        topLevelPage2.open();

        topLevelPage1.close();

        expect(tabris.ui.get("activePage")).toBe(topLevelPage2);
      });

      it("when a lower top-level page on stack is closed, does not close stacked pages", function() {
        topLevelPage1.open();
        topLevelPage2.open();
        page1.open();
        page2.open();

        topLevelPage1.close();

        expect(page1.isDisposed()).toBe(false);
        expect(page2.isDisposed()).toBe(false);
        expect(ui.get("activePage")).toBe(page2);
      });

      it("when a page on stack is closed, sets activePage *before* disposing pages", function() {
        // Clients can fail when the active page is disposed before it is replaced
        topLevelPage1.open();
        page1.open();
        page2.open();
        page2.on("dispose", function() {
          expect(tabris.ui.get("activePage")).toBe(page1);
        });

        page2.close();
      });

      it("fails when closing the last page", function() {
        topLevelPage1.open();

        expect(function() {
          topLevelPage1.close();
        }).toThrowError("Cannot close the last page");
      });

    });

    it("ShowPreviousPage does not fail without a page", function() {
      expect(function() {
        tabris._notify(ui.cid, "ShowPreviousPage", {});
      }).not.toThrow();
    });

  });

});
