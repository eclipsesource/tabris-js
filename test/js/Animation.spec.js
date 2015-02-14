describe("Animation", function() {

  var proxy, nativeBridge;
  var consoleBackup = window.console;

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
    proxy = new tabris.Proxy("proxy-id");
  });

  afterEach(function() {
    window.console = consoleBackup;
  });

  describe("animate", function() {

    it("creates native animation with target", function() {
      tabris.Animation.animate.call(proxy, {}, {});
      expect(createOp().target).toBe("proxy-id");
    });

    it("sets animated properties", function() {
      tabris.Animation.animate.call(proxy, {opacity: 0.4, transform: {rotation: 0.5}}, {});
      expect(createOp().properties).toEqual({opacity: 0.4, transform: {rotation: 0.5}});
    });

    it("sets valid options only", function() {
      tabris.Animation.animate.call(proxy, {}, {
        delay: 10, duration: 100, repeat: 1, reverse: true, easing: "ease-out", foo: "bar"
      });
      expect(createOp()).toEqual({
        delay: 10,
        duration: 100,
        repeat: 1,
        reverse: true,
        easing: "ease-out",
        target: "proxy-id",
        properties: {}
      });
    });

    it("warns against invalid options", function() {
      window.console = jasmine.createSpyObj("console", ["log", "info", "warn", "error"]);

      tabris.Animation.animate.call(proxy, {}, {foo: "bar"});

      expect(console.warn).toHaveBeenCalledWith("Invalid animation option \"foo\"");
    });

    it("warns against invalid properties", function() {
      window.console = jasmine.createSpyObj("console", ["log", "info", "warn", "error"]);

      tabris.Animation.animate.call(proxy, {background: "#00ff00", opacity: 0}, {});

      expect(console.warn).toHaveBeenCalledWith("Invalid animation property \"background\"");
      expect(createOp().properties).toEqual({opacity: 0});
    });

    it("starts animation", function() {
      tabris.Animation.animate.call(proxy, {}, {});
      expect(nativeBridge.calls({op: "call", id: animationId(), method: "start"}).length).toBe(1);
    });

    it("disposes animation on completion", function() {
      tabris.Animation.animate.call(proxy, {}, {});
      expect(nativeBridge.calls({op: "destroy", id: animationId()}).length).toBe(0);

      tabris._notify(animationId(), "Completion", {});
      expect(nativeBridge.calls({op: "destroy", id: animationId()}).length).toBe(1);
    });

    it("returns Animation", function() {
      expect(tabris.Animation.animate.call(proxy, {}, {})).toEqual(jasmine.any(tabris.Animation));
    });

  });

  describe("instance", function() {

    var animation;

    beforeEach(function() {
      animation = tabris.Animation.animate.call(proxy, {}, {});
    });

    it("is not accepted as a widget", function() {
      var page = tabris.create("Composite");

      expect(function() {
        page.append(animation);
      }).toThrow();
    });

    it("issues listen call for Progress", function() {
      animation.on("progress", function() {});

      expect(nativeBridge.calls({
        op: "listen",
        id: animationId(),
        event: "Progress",
        listen: true
      }).length).toBe(1);
    });

    it("issues listen call for Start", function() {
      animation.on("start", function() {});

      expect(nativeBridge.calls({
        op: "listen",
        id: animationId(),
        event: "Start",
        listen: true
      }).length).toBe(1);
    });

    it("issues listen call for Completion", function() {
      animation.on("completion", function() {});

      expect(nativeBridge.calls({
        op: "listen",
        id: animationId(),
        event: "Completion",
        listen: true
      }).length).toBe(1);
    });

    it("does not issues listen call after completion", function() {
      tabris._notify(animationId(), "Completion", {});

      animation.on("progress", function() {});

      expect(nativeBridge.calls({
        op: "listen",
        id: animationId(),
        event: "Progress",
        listen: true
      }).length).toBe(0);
    });

    it("receives animation Start event", function() {
      var listener = jasmine.createSpy();
      animation.on("start", listener);

      tabris._notify(animationId(), "Start", {});

      expect(listener).toHaveBeenCalled();
    });

    it("receives animation Progress event", function() {
      var listener = jasmine.createSpy();
      animation.on("progress", listener);

      tabris._notify(animationId(), "Progress", {});

      expect(listener).toHaveBeenCalled();
    });

    it("receives animation Completion event", function() {
      var listener = jasmine.createSpy();
      animation.on("completion", listener);

      tabris._notify(animationId(), "Completion", {});

      expect(listener).toHaveBeenCalled();
    });

    it("cancel calls \"cancel\"", function() {
      animation.cancel();

      expect(nativeBridge.calls({
        op: "call",
        id: animationId(),
        method: "cancel"
      }).length).toBe(1);
    });

    it("cancel is ignored if animation is complete", function() {
      tabris._notify(animationId(), "Completion", {});

      expect(function() {
        animation.cancel();
      }).not.toThrow();
    });

  });

});
