/**
 * Copyright (c) 2014 EclipseSource.
 * All rights reserved.
 */

describe("UIProxy", function() {

  var nativeBridge;
  var uiProxy;
  var uiId;
  var shellId;

  beforeEach(function() {
    nativeBridge = new NativeBridgeSpy();
    tabris._reset();
    tabris._start(nativeBridge);
    uiProxy = new tabris.UIProxy();
  });

  describe("create", function() {

    beforeEach(function() {
      uiProxy._create();
    });

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

    it("listens on tabris UI ShowPage and ShowPreviousPage events", function() {
      var uiId = nativeBridge.calls({op: "create", type: "tabris.UI"})[0].id;
      expect(nativeBridge.calls({op: "listen", id: uiId, event: "ShowPage"}).length).toBe(1);
      expect(nativeBridge.calls({op: "listen", id: uiId, event: "ShowPreviousPage"}).length)
          .toBe(1);
    });

  });

  describe("after creation", function() {

    beforeEach(function() {
      uiProxy._create();
      tabris._uiProxy = uiProxy;
      shellId = nativeBridge.calls({op: "create", type: "rwt.widgets.Shell"})[0].id;
      uiId = nativeBridge.calls({op: "create", type: "tabris.UI"})[0].id;
      nativeBridge.resetCalls();
    });

    afterEach(function() {
      delete tabris._uiProxy;
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

    describe("when a page is created", function() {

      var page;

      beforeEach(function() {
        page = tabris.create("Page", {title: "Foo"});
        page.open();
        spyOn(page, "close");
      });

      it("ShowPreviousPage event closes page", function() {
        tabris._notify(uiId, "ShowPreviousPage", {});
        expect(page.close).toHaveBeenCalled();
      });

    });

  });


});
