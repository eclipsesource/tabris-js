describe("Action", function() {

  var nativeBridge;

  beforeEach(function() {
    nativeBridge = new NativeBridgeSpy();
    tabris._reset();
    tabris._init(nativeBridge);
    tabris.ui = new tabris.create("_UI");
  });

  afterEach(function() {
    delete tabris.ui;
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

    it("created action's parent is set to tabris.ui", function() {
      expect(actionCreateCalls[0].properties.parent).toEqual(tabris.ui.cid);
    });

    it("tabris.ui.children has Action", function() {
      expect(tabris.ui.children("Action").length).toBe(1);
    });

    it("properties are passed to created action", function() {
      expect(actionCreateCalls[0].properties.title).toEqual("Foo");
      expect(actionCreateCalls[0].properties.enabled).toBe(true);
    });

  });

  describe("set", function() {

    var action;

    beforeEach(function() {
      action = tabris.create("Action");
      nativeBridge.resetCalls();
    });

    it("translates visible to visibility", function() {
      action.set("visible", true);

      var call = nativeBridge.calls({op: "set"})[0];
      expect(call.properties.visibility).toBe(true);
    });

    it("translates placement priority to uppercase", function() {
      action.set("placementPriority", "low");

      var call = nativeBridge.calls({op: "set"})[0];
      expect(call.properties.placementPriority).toBe("LOW");
    });

  });

  describe("get", function() {

    var action;

    beforeEach(function() {
      action = tabris.create("Action");
      nativeBridge.resetCalls();
    });

    it("returns initial default property values", function() {
      expect(action.get("image")).toBe(null);
      expect(action.get("visible")).toBe(true);
      // TODO: Priority can not yet be cached because the custom getter is doing the decoding:
      //expect(action.get("placementPriority")).toBe("normal");
    });

    it("translates placementPriority to lowercase", function() {
      spyOn(nativeBridge, "get").and.returnValue("LOW");

      var result = action.get("placementPriority");

      expect(result).toBe("low");
    });

    it("translates placementPriority to lowercase", function() {
      spyOn(nativeBridge, "get").and.returnValue("LOW");

      var result = action.get("placementPriority");

      expect(result).toBe("low");
    });

  });

  describe("select event", function() {

    var action, listener;

    beforeEach(function() {
      action = tabris.create("Action");
      listener = jasmine.createSpy();
    });

    it("is fired with parameters", function() {
      action.on("select", listener);

      tabris._notify(action.cid, "Selection", {});

      expect(listener.calls.count()).toBe(1);
      expect(listener.calls.argsFor(0)[0]).toBe(action);
      expect(listener.calls.argsFor(0)[1]).toEqual({});
    });

    it("is fired with parameters (legacy)", function() {
      action.on("selection", listener);

      tabris._notify(action.cid, "Selection", {});

      expect(listener.calls.count()).toBe(1);
      expect(listener.calls.argsFor(0)[0]).toBe(action);
      expect(listener.calls.argsFor(0)[1]).toEqual({});
    });

  });

});
