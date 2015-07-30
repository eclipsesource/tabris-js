describe("Animation", function() {

  var widget, nativeBridge;

  function animationId() {
    return nativeBridge.calls({op: "create", type: "tabris.Animation"}).pop().id;
  }

  function createOp() {
    return nativeBridge.calls({op: "create", type: "tabris.Animation"}).pop().properties;
  }

  beforeEach(function() {
    nativeBridge = new NativeBridgeSpy();
    tabris._reset();
    tabris._init(nativeBridge);
    tabris.registerWidget("TestType", {_properties: {foo: true}});
    widget = tabris.create("TestType");
  });

  afterEach(function() {
    delete tabris.TestType;
  });

  describe("widget.animate", function() {

    it("creates native animation with target", function() {
      widget.animate({}, {});
      expect(createOp().target).toBe(widget.cid);
    });

    it("disposes Animation object on widget dispose", function() {
      widget.animate({}, {});
      var animation = tabris(animationId());

      widget.dispose();

      expect(animation.isDisposed()).toBe(true);
    });

    it("does not keep references to Animation object after completion", function() {
      widget.animate({}, {});
      var animation = tabris(animationId());
      tabris._notify(animation.cid, "Completion", {});
      spyOn(animation, "dispose");

      widget.dispose();

      expect(animation.dispose).not.toHaveBeenCalled();
    });

    it("sets animated properties on animation", function() {
      widget.animate({opacity: 0.4, transform: {rotation: 0.5}}, {});
      var expected = {
        opacity: 0.4,
        transform: {rotation: 0.5, scaleX: 1, scaleY: 1, translationX: 0, translationY: 0}
      };
      expect(createOp().properties).toEqual(expected);
    });

    it("caches animated properties in widget", function() {
      widget.animate({opacity: 0.4, transform: {rotation: 0.5}}, {});
      expect(widget.get("opacity")).toBe(0.4);
      expect(widget.get("transform")).toEqual({
        rotation: 0.5,
        scaleX: 1,
        scaleY: 1,
        translationX: 0,
        translationY: 0
      });
    });

    it("caches only valid properties in widget", function() {
      widget.set("foo", 1);
      widget.animate({opacity: 0.4, transform: {foo: 0.5}, foo: 2}, {});
      expect(widget.get("foo")).toBe(1);
      expect(widget.get("opacity")).toBe(0.4);
      expect(widget.get("transform")).toEqual({
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        translationX: 0,
        translationY: 0
      });
    });

    it("sets valid options only", function() {
      widget.animate({}, {
        delay: 10, duration: 100, repeat: 1, reverse: true, easing: "ease-out", foo: "bar"
      });
      expect(createOp()).toEqual({
        delay: 10,
        duration: 100,
        repeat: 1,
        reverse: true,
        easing: "ease-out",
        target: widget.cid,
        properties: {}
      });
    });

    it("warns against invalid options", function() {
      spyOn(console, "warn");

      widget.animate({}, {foo: "bar"});

      expect(console.warn).toHaveBeenCalledWith("TestType: Ignored invalid animation option \"foo\"");
    });

    it("warns against invalid properties", function() {
      spyOn(console, "warn");

      widget.animate({background: "#00ff00", opacity: 0}, {});

      expect(console.warn).toHaveBeenCalledWith("TestType: Ignored invalid animation property \"background\"");
      expect(createOp().properties).toEqual({opacity: 0});
    });

    it("warns against invalid property values", function() {
      spyOn(console, "warn");

      widget.animate({opacity: 0, transform: {foo: "bar"}}, {});

      expect(console.warn).toHaveBeenCalledWith("TestType: Ignored invalid animation property value for \"transform\"");
      expect(createOp().properties).toEqual({opacity: 0});
    });

    it("issues listen call for Start", function() {
      widget.animate({}, {});
      expect(nativeBridge.calls({
        op: "listen",
        id: animationId(),
        event: "Start",
        listen: true
      }).length).toBe(1);
    });

    it("issues listen call for Completion", function() {
      widget.animate({}, {});
      expect(nativeBridge.calls({
        op: "listen",
        id: animationId(),
        event: "Completion",
        listen: true
      }).length).toBe(1);
    });

    it("starts animation", function() {
      widget.animate({}, {});
      expect(nativeBridge.calls({op: "call", id: animationId(), method: "start"}).length).toBe(1);
    });

    it("disposes animation on completion", function() {
      widget.animate({}, {});
      expect(nativeBridge.calls({op: "destroy", id: animationId()}).length).toBe(0);

      tabris._notify(animationId(), "Completion", {});
      expect(nativeBridge.calls({op: "destroy", id: animationId()}).length).toBe(1);
    });

    it("returns nothing", function() {
      expect(widget.animate({}, {})).not.toBeDefined();
    });

  });

  describe("events", function() {

    beforeEach(function() {
      widget.animate({}, {duration: 123, name: "bar"});
    });

    it("animationstart", function() {
      var listener = jasmine.createSpy();
      widget.on("animationstart", listener);

      tabris._notify(animationId(), "Start", {});

      expect(listener).toHaveBeenCalled();
      expect(listener.calls.argsFor(0)[0]).toBe(widget);
      expect(listener.calls.argsFor(0)[1]).toEqual({duration: 123, name: "bar"});
    });

    it("animationend", function() {
      var listener = jasmine.createSpy();
      widget.on("animationend", listener);

      tabris._notify(animationId(), "Completion", {});

      expect(listener).toHaveBeenCalled();
      expect(listener.calls.argsFor(0)[0]).toBe(widget);
      expect(listener.calls.argsFor(0)[1]).toEqual({duration: 123, name: "bar"});
    });

  });

});
