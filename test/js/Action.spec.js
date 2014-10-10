/**
 * Copyright (c) 2014 EclipseSource.
 * All rights reserved.
 */

describe("Action", function() {

  var nativeBridge;

  beforeEach(function() {
    nativeBridge = new NativeBridgeSpy();
    tabris._reset();
    tabris._start(nativeBridge);
    tabris._uiProxy = new tabris.UIProxy();
    tabris._uiProxy._ui = new tabris.Proxy();
  });

  afterEach(function() {
    delete tabris._uiProxy;
  });

  describe("create", function() {

    var actionCreateCalls;

    beforeEach(function() {
      tabris.create("Action", {title: "Foo", enabled: true});
      actionCreateCalls = nativeBridge.calls({op: "create", type: "tabris.Action"});
    });

    it("creates an action", function() {
      expect(actionCreateCalls.length).toBe(1);
    });

    it("created action's parent is set to tabris.UI", function() {
      expect(actionCreateCalls[0].properties.parent).toEqual(tabris._uiProxy._ui.id);
    });

    it("properties are passed to created action", function() {
      expect(actionCreateCalls[0].properties.title).toEqual("Foo");
      expect(actionCreateCalls[0].properties.enabled).toBe(true);
    });

  });

});
