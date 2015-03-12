describe("gestures", function() {

  var nativeBridge, widget;

  beforeEach(function() {
    nativeBridge = new NativeBridgeSpy();
    tabris._reset();
    tabris._init(nativeBridge);
    tabris.registerWidget("TestType", {});
    widget = tabris.create("TestType");
    nativeBridge.resetCalls();
  });

  afterEach(function() {
    delete tabris.TestType;
  });

  it("get returns empty object as initial value", function() {
    expect(widget.get("gestures")).toEqual({});
  });

  describe("setting single gesture", function() {

    var calls;

    beforeEach(function() {
      widget.set("gestures", {foo: {type: "tap", fingers: 2}});
      calls = nativeBridge.calls({op: "create", type: "tabris.GestureRecognizer"});
    });

    it("does not SET property", function() {
      expect(nativeBridge.calls({id: widget.cid, op: "set"}).length).toBe(0);
    });

    it("CREATEs GestureRecognizer", function() {
      expect(calls.length).toBe(1);
    });

    it("CREATEs GestureRecognizer with type", function() {
      expect(calls[0].properties.type).toBe("tap");
    });

    it("CREATEs GestureRecognizer with target", function() {
      expect(calls[0].properties.target).toBe(widget.cid);
    });

    it("CREATEs GestureRecognizer with configuration properties", function() {
      expect(calls[0].properties.fingers).toBe(2);
    });

    it("GestureRecognizer LISTENs to gesture events", function() {
      var call = nativeBridge.calls({op: "listen", id: calls[0].id, event: "gesture"})[0];
      expect(call.listen).toBe(true);
    });

    it("supports getter", function() {
      var properties = {foo: {type: "tap"}};
      widget.set("gestures", properties);

      expect(widget.get("gestures")).toEqual(properties);
    });

    it("disposes old GestureRecognizer", function() {
      widget.set("gestures", {});

      expect(nativeBridge.calls({op: "destroy", id: calls[0].id}).length).toBe(1);
    });

    it("disposing widget disposes existing GestureRecognizer", function() {
      widget.dispose();

      expect(nativeBridge.calls({op: "destroy", id: calls[0].id}).length).toBe(1);
    });

    describe("on gesture notify", function() {

      it("triggers matching widget event", function() {
        var listener = jasmine.createSpy();
        widget.on("foo", listener);

        tabris._notify(calls[0].id, "gesture", {});

        expect(listener).toHaveBeenCalled();
      });

      it("forwards event object", function() {
        var listener = jasmine.createSpy();
        widget.on("foo", listener);

        tabris._notify(calls[0].id, "gesture", {state: "recognized"});

        expect(listener).toHaveBeenCalledWith({state: "recognized"});
      });

    });

  });

  describe("setting multiple gestures", function() {

    var calls;

    beforeEach(function() {
      widget.set("gestures", {foo: {type: "tap", fingers: 2}, bar: {type: "pan", fingers: 3}});
      calls = nativeBridge.calls({op: "create", type: "tabris.GestureRecognizer"});
    });

    it("CREATEs multiple GestureRecognizers", function() {
      expect(calls.length).toBe(2);
    });

    it("disposing widget disposes all GestureRecognizers", function() {
      widget.dispose();

      expect(nativeBridge.calls({op: "destroy", id: calls[0].id}).length).toBe(1);
      expect(nativeBridge.calls({op: "destroy", id: calls[1].id}).length).toBe(1);
    });

  });

  // TODO: test setting invalid gestures values
  // TODO: test setting invalid gestures configuration (not object, no type)

});
