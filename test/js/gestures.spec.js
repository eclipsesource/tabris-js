describe("gestures:", function() {

  var nativeBridge, widget;

  beforeEach(function() {
    nativeBridge = new NativeBridgeSpy();
    tabris._reset();
    tabris._init(nativeBridge);
    tabris.registerWidget("TestType", {});
  });

  afterEach(function() {
    delete tabris.TestType;
  });

  function gestureCreate() {
    return nativeBridge.calls({op: "create", type: "tabris.GestureRecognizer"});
  }

  function widgetCreate() {
    return nativeBridge.calls({op: "create", type: "TestType"});
  }

  it("get returns object with pre-configured gestures as initial value", function() {
    var gestures = tabris.create("TestType").get("gestures");
    expect(gestures.tap).toEqual({type: "tap"});
    expect(gestures.longpress).toEqual({type: "longpress"});
  });

  describe("setting single gesture", function() {

    beforeEach(function() {
      widget = tabris.create("TestType", {
        gestures: {foo: {type: "tap", fingers: 2}}
      });

    });

    it("does not SET property", function() {
      expect(widgetCreate()[0].properties.gestures).toBeUndefined();
    });

    it("does not CREATE GestureRecognizer", function() {
      expect(gestureCreate().length).toBe(0);
    });

    it("extends pre-configured gestures", function() {
      var gestures = widget.get("gestures");
      expect(gestures.foo).toEqual({type: "tap", fingers: 2});
      expect(gestures.tap).toEqual({type: "tap"});
    });

    it("prevent overwriting global default gestures", function() {
      var defaultGestures = tabris.create("TestType").get("gestures");
      defaultGestures.tap = false;
      expect(tabris.create("TestType").get("gestures").tap).toEqual({type: "tap"});
    });

    it("allows overwriting pre-configured gestures", function() {
      widget.set("gestures", {tap: {type: "tap", touches: 2}});
      expect(widget.get("gestures").tap).toEqual({type: "tap", touches: 2});
    });

    describe("and adding matching gesture listener", function() {

      beforeEach(function() {
        widget.on("foo", function() {});
      });

      it("CREATEs GestureRecognizer", function() {
        expect(gestureCreate().length).toBe(1);
      });

      it("CREATEs GestureRecognizer with type", function() {
        expect(gestureCreate()[0].properties.type).toBe("tap");
      });

      it("CREATEs GestureRecognizer with target", function() {
        expect(gestureCreate()[0].properties.target).toBe(widget.cid);
      });

      it("CREATEs GestureRecognizer with configuration properties", function() {
        expect(gestureCreate()[0].properties.fingers).toBe(2);
      });

      it("GestureRecognizer LISTENs to gesture events", function() {
        var call = nativeBridge.calls({op: "listen", id: gestureCreate()[0].id, event: "gesture"})[0];
        expect(call.listen).toBe(true);
      });

      it("disposing widget disposes existing GestureRecognizer", function() {
        widget.dispose();

        expect(nativeBridge.calls({op: "destroy", id: gestureCreate()[0].id}).length).toBe(1);
      });

      describe("multiple times", function() {

        beforeEach(function() {
          widget.on("foo", function() {
          });
        });

        it("CREATEs only one GestureRecognizer", function() {
          expect(gestureCreate().length).toBe(1);
        });

      });

      describe(", then notifying the recognizer", function() {

        it("triggers matching widget event", function() {
          var listener = jasmine.createSpy();
          widget.on("foo", listener);

          tabris._notify(gestureCreate()[0].id, "gesture", {});

          expect(listener).toHaveBeenCalled();
        });

        it("forwards event object", function() {
          var listener = jasmine.createSpy();
          widget.on("foo", listener);

          tabris._notify(gestureCreate()[0].id, "gesture", {state: "recognized"});

          expect(listener.calls.count()).toBe(1);
          expect(listener.calls.argsFor(0)[0]).toBe(widget);
          expect(listener.calls.argsFor(0)[1]).toEqual({state: "recognized"});
        });

      });

      describe(", then removing all listener", function() {

        beforeEach(function() {
          widget.off("foo");
        });

        it("disposes matching GestureRecognizer", function() {
          expect(nativeBridge.calls({op: "destroy", id: gestureCreate()[0].id}).length).toBe(1);
        });

      });

    });

  });

  describe("listening to multiple gestures", function() {

    beforeEach(function() {
      widget = tabris.create("TestType", {
        gestures: {foo: {type: "tap", fingers: 2}, bar: {type: "pan", fingers: 3}}
      });
      widget.on("foo", function() {}).on("bar", function() {});
    });

    it("CREATEs multiple GestureRecognizers", function() {
      expect(gestureCreate().length).toBe(2);
    });

    it("disposing widget disposes all GestureRecognizers", function() {
      widget.dispose();

      expect(nativeBridge.calls({op: "destroy", id: gestureCreate()[0].id}).length).toBe(1);
      expect(nativeBridge.calls({op: "destroy", id: gestureCreate()[1].id}).length).toBe(1);
    });

    it("disposing widget disposes all remaining GestureRecognizers", function() {
      widget.off("bar");
      widget.dispose();

      expect(nativeBridge.calls({op: "destroy", id: gestureCreate()[0].id}).length).toBe(1);
      expect(nativeBridge.calls({op: "destroy", id: gestureCreate()[1].id}).length).toBe(1);
    });

  });

  // TODO: test setting invalid gestures values
  // TODO: test setting invalid gestures configuration (not object, no type)

});
