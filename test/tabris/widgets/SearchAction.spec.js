describe("SearchAction", function() {

  var nativeBridge;

  beforeEach(function() {
    nativeBridge = new NativeBridgeSpy();
    tabris._reset();
    tabris._init(nativeBridge);
    tabris.ui = new tabris._UI();
  });

  afterEach(function() {
    delete tabris.ui;
  });

  describe("create", function() {

    var actionCreateCalls;

    beforeEach(function() {
      new tabris.SearchAction({title: "Foo", enabled: true});
      actionCreateCalls = nativeBridge.calls({op: "create", type: "tabris.SearchAction"});
    });

    it("creates an action", function() {
      expect(actionCreateCalls.length).toBe(1);
    });

    it("created action's parent is set to tabris.ui", function() {
      expect(actionCreateCalls[0].properties.parent).toEqual(tabris.ui.cid);
    });

    it("tabris.ui.children has SearchAction", function() {
      expect(tabris.ui.children("SearchAction").length).toBe(1);
    });

    it("properties are passed to created action", function() {
      expect(actionCreateCalls[0].properties.title).toEqual("Foo");
      expect(actionCreateCalls[0].properties.enabled).toBe(true);
    });

  });

  describe("set", function() {

    var action;

    beforeEach(function() {
      action = new tabris.SearchAction();
      nativeBridge.resetCalls();
    });

    it("sets placement priority to uppercase", function() {
      action.set("placementPriority", "low");

      var call = nativeBridge.calls({op: "set"})[0];
      expect(call.properties.placementPriority).toBe("low");
    });

  });

  describe("get", function() {

    var action;

    beforeEach(function() {
      action = new tabris.SearchAction();
      nativeBridge.resetCalls();
    });

    it("returns cached placementPriority", function() {
      action.set("placementPriority", "low");

      var result = action.get("placementPriority");

      expect(result).toBe("low");
    });

    it("returns initial values", function() {
      expect(action.get("enabled")).toBe(true);
      expect(action.get("image")).toBe(null);
      expect(action.get("title")).toBe("");
      expect(action.get("visible")).toBe(true);
      expect(action.get("proposals")).toEqual([]);
      expect(action.get("placementPriority")).toBe("normal");
    });

  });

  describe("native events", function() {

    var action, listener;

    beforeEach(function() {
      action = new tabris.SearchAction();
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

    var action;

    beforeEach(function() {
      action = new tabris.SearchAction();
    });

    it("invokes 'open' call operation on native bridge", function() {
      spyOn(nativeBridge, "call");

      action.open();

      expect(nativeBridge.call).toHaveBeenCalledWith(action.cid, "open", {});
    });

    it("returns self to allow chaining", function() {
      var result = action.open();

      expect(result).toBe(action);
    });

  });

});
