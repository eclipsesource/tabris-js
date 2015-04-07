describe("SearchAction", function() {

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
      tabris.create("SearchAction", {title: "Foo", enabled: true});
      actionCreateCalls = nativeBridge.calls({op: "create", type: "tabris.SearchAction"});
    });

    it("creates an action", function() {
      expect(actionCreateCalls.length).toBe(1);
    });

    it("created action's parent is set to tabris.UI", function() {
      expect(actionCreateCalls[0].properties.parent).toEqual(tabris.ui.cid);
    });

    it("properties are passed to created action", function() {
      expect(actionCreateCalls[0].properties.title).toEqual("Foo");
      expect(actionCreateCalls[0].properties.enabled).toBe(true);
    });

  });

  describe("set", function() {

    var action;

    beforeEach(function() {
      action = tabris.create("SearchAction");
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
      action = tabris.create("SearchAction");
      nativeBridge.resetCalls();
    });

    it("translates placementPriority to lowercase", function() {
      spyOn(nativeBridge, "get").and.returnValue("LOW");

      var result = action.get("placementPriority");

      expect(result).toBe("low");
    });

    it("returns initial values", function() {
      expect(action.get("enabled")).toBe(true);
      expect(action.get("image")).toBe(null);
      expect(action.get("title")).toBe("");
      expect(action.get("visible")).toBe(true);
      expect(action.get("proposals")).toEqual([]);
    });

  });

  describe("native events", function() {

    var action, listener;

    beforeEach(function() {
      action = tabris.create("SearchAction");
      listener = jasmine.createSpy();
    });

    var checkEvent = function(value) {
      expect(listener.calls.count()).toBe(1);
      expect(listener.calls.argsFor(0)[0]).toBe(action);
      if (arguments.length === 1) {
        expect(listener.calls.argsFor(0)[1]).toEqual(value);
        expect(listener.calls.argsFor(0)[2]).toEqual({});
      } else {
        expect(listener.calls.argsFor(0)[1]).toEqual({});
      }
    };
    var checkListen = function(event) {
      var listen = nativeBridge.calls({op: "listen", id: action.cid});
      expect(listen.length).toBe(1);
      expect(listen[0].event).toBe(event);
      expect(listen[0].listen).toBe(true);
    };

    it("select", function() {
      action.on("select", listener);
      tabris._notify(action.cid, "Selection", {});

      checkListen("Selection");
      checkEvent();
    });

    it("accept", function() {
      action.on("accept", listener);
      tabris._notify(action.cid, "Search", {query: "foo"});

      checkListen("Search");
      checkEvent("foo");
    });

  });

});
