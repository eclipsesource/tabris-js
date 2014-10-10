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

  describe("install", function() {

    var target;

    beforeEach(function() {
      target = {};
      spyOn(uiProxy, "createPage");
      spyOn(uiProxy, "createAction");
      uiProxy._install(target);
    });

    it("adds createPage function to target object", function() {
      target.createPage();

      expect(uiProxy.createPage).toHaveBeenCalled();
      expect(uiProxy.createPage.calls.first().object).toBe(uiProxy);
    });

    it("adds createAction function to target object", function() {
      target.createAction();

      expect(uiProxy.createAction).toHaveBeenCalled();
      expect(uiProxy.createAction.calls.first().object).toBe(uiProxy);
    });

  });

  describe("after creation", function() {

    beforeEach(function() {
      uiProxy._create();
      shellId = nativeBridge.calls({op: "create", type: "rwt.widgets.Shell"})[0].id;
      uiId = nativeBridge.calls({op: "create", type: "tabris.UI"})[0].id;
      nativeBridge.resetCalls();
    });

    describe("createAction", function() {

      var handler;
      var actionCreateCalls;

      beforeEach(function() {
        handler = jasmine.createSpy();
        uiProxy.createAction({title: "Foo", enabled: true}, handler);
        actionCreateCalls = nativeBridge.calls({op: "create", type: "tabris.Action"});
      });

      it("creates an action", function() {
        expect(actionCreateCalls.length).toBe(1);
      });

      it("created action's parent is set to tabris.UI", function() {
        expect(actionCreateCalls[0].properties.parent).toEqual(uiId);
      });

      it("properties are passed to created action", function() {
        expect(actionCreateCalls[0].properties.title).toEqual("Foo");
        expect(actionCreateCalls[0].properties.enabled).toBe(true);
      });

      it("listens on created action", function() {
        var actionId = actionCreateCalls[0].id;

        expect(nativeBridge.calls({op: "listen", id: actionId, listen: true}).length).toBe(1);
      });

      it("handler is notified on action event", function() {
        var actionId = actionCreateCalls[0].id;

        tabris._notify(actionId, "Selection", {foo: 23});

        expect(handler).toHaveBeenCalledWith({foo: 23});
      });

    });

    describe("createAction without a handler function", function() {

      var actionCreateCalls;

      beforeEach(function() {
        uiProxy.createAction({title: "Foo", enabled: true});
        actionCreateCalls = nativeBridge.calls({op: "create", type: "tabris.Action"});
      });

      it("creates an action anyway", function() {
        expect(actionCreateCalls.length).toBe(1);
      });

      it("does not listen on created action", function() {
        var actionId = actionCreateCalls[0].id;

        expect(nativeBridge.calls({op: "listen", id: actionId, listen: true}).length).toBe(0);
      });

    });

    describe("createPage", function() {

      beforeEach(function() {
        tabris._uiProxy = uiProxy;
      });

      afterEach(function() {
        delete tabris._uiProxy;
      });

      it("creates a Page and a Composite", function() {
        uiProxy.createPage();

        var createCalls = nativeBridge.calls({op: "create"});
        expect(createCalls.select({type: "tabris.Page"}).length).toBe(1);
        expect(createCalls.select({type: "rwt.widgets.Composite"}).length).toBe(1);
      });

      it("passes page properties to created Page", function() {
        uiProxy.createPage({title: "foo"});

        var createCall = nativeBridge.calls({op: "create", type: "tabris.Page"})[0];
        expect(createCall.properties.title).toBe("foo");
      });

      it("passes non-page properties to created Composite", function() {
        uiProxy.createPage({background: "red"});

        var createCall = nativeBridge.calls({op: "create", type: "rwt.widgets.Composite"})[0];
        expect(createCall.properties.background).toEqual([255, 0, 0, 255]);
      });

      it("returns a Page", function() {
        var page = uiProxy.createPage();

        expect(page instanceof tabris.Page).toBe(true);
      });

      it("ShowPreviousPage event closes page", function() {
        var page = uiProxy.createPage({});
        page.open();
        spyOn(page, "close");

        tabris._notify(uiId, "ShowPreviousPage", {});

        expect(page.close).toHaveBeenCalled();
      });

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

  });

});
