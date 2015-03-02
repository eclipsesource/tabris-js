describe("WindowTimers", function() {

  var nativeBridge;
  var target;

  beforeEach(function() {
    nativeBridge = new NativeBridgeSpy();
    tabris._reset();
    tabris._init(nativeBridge);
    target = {};
  });

  it("do not overwrite existing window methods", function() {
    var setTimeout = target.setTimeout = function() {};
    var setInterval = target.setInterval = function() {};
    var clearTimeout = target.clearTimeout = function() {};
    var clearInterval = target.clearInterval = function() {};

    tabris._addWindowTimerMethods(target);

    expect(target.setTimeout).toBe(setTimeout);
    expect(target.setInterval).toBe(setInterval);
    expect(target.clearTimeout).toBe(clearTimeout);
    expect(target.clearInterval).toBe(clearInterval);
  });

  describe("created methods", function() {

    beforeEach(function() {
      tabris._addWindowTimerMethods(target);
    });

    describe("setTimeout", function() {

      var delay = 23;
      var taskId;
      var callback;
      var createCall, listenCall, startCall;

      beforeEach(function() {
        callback = jasmine.createSpy("callback");
        taskId = target.setTimeout(callback, delay);
        createCall = nativeBridge.calls({op: "create", type: "tabris.Timer"})[0];
        listenCall = nativeBridge.calls({id: createCall.id, op: "listen", event: "Run"})[0];
        startCall = nativeBridge.calls({id: createCall.id, op: "call", method: "start"})[0];
      });

      it("creates native Timer", function() {
        expect(createCall).toBeDefined();
      });

      it("creates native Timer when tabris is being started", function() {
        tabris._ready = false;
        taskId = target.setTimeout(callback, delay);

        tabris._init(nativeBridge);

        createCall = nativeBridge.calls({op: "create", type: "tabris.Timer"})[0];
        expect(createCall).toBeDefined();
      });

      it("passes arguments to Timer creation", function() {
        expect(createCall.properties.delay).toBe(delay);
        expect(createCall.properties.repeat).toBe(false);
      });

      it("passes 0 delay when argument left out", function() {
        nativeBridge.resetCalls();
        target.setTimeout(callback);
        createCall = nativeBridge.calls({op: "create", type: "tabris.Timer"})[0];

        expect(createCall.properties.delay).toBe(0);
      });

      it("passes 0 delay when argument is not a number", function() {
        [1 / 0, NaN, "", {}, false].forEach(function(value) {
          nativeBridge.resetCalls();
          target.setTimeout(callback, value);
          createCall = nativeBridge.calls({op: "create", type: "tabris.Timer"})[0];

          expect(createCall.properties.delay).toBe(0);
        });
      });

      it("passes 0 delay when argument is negative", function() {
        nativeBridge.resetCalls();
        target.setTimeout(callback, -1);
        createCall = nativeBridge.calls({op: "create", type: "tabris.Timer"})[0];

        expect(createCall.properties.delay).toBe(0);
      });

      it("passes rounded delay", function() {
        nativeBridge.resetCalls();
        target.setTimeout(callback, 3.14);
        createCall = nativeBridge.calls({op: "create", type: "tabris.Timer"})[0];

        expect(createCall.properties.delay).toBe(3);
      });

      it("listens on Run event of native Timer", function() {
        expect(listenCall).toBeDefined();
      });

      it("starts the native Timer", function() {
        expect(startCall).toBeDefined();
      });

      it("create, listen, start are called in this order", function() {
        var createPosition = nativeBridge.calls().indexOf(createCall);
        var listenPosition = nativeBridge.calls().indexOf(listenCall);
        var startPosition = nativeBridge.calls().indexOf(startCall);
        expect(listenPosition).toBeGreaterThan(createPosition);
        expect(startPosition).toBeGreaterThan(listenPosition);
      });

      it("returns a number", function() {
        expect(typeof taskId).toBe("number");
      });

      it("returns ascending numbers", function() {
        var nextTaskId = target.setTimeout(callback, 23);
        expect(nextTaskId).toBeGreaterThan(taskId);
      });

      describe("when notified", function() {

        beforeEach(function() {
          tabris._notify(createCall.id, "Run", {});
        });

        it("callback is called", function() {
          expect(callback).toHaveBeenCalled();
        });

        it("timer is disposed", function() {
          var destroyCall = nativeBridge.calls({id: createCall.id, op: "destroy"})[0];
          expect(destroyCall).toBeDefined();
        });

      });

      describe("clearTimeout", function() {

        beforeEach(function() {
          target.clearTimeout(taskId);
        });

        it("calls native cancelTask", function() {
          var cancelCall = nativeBridge.calls({id: createCall.id, op: "call", method: "cancel"})[0];
          expect(cancelCall).toBeDefined();
        });

        it("destroys native timer", function() {
          var destroyCall = nativeBridge.calls({id: createCall.id, op: "destroy"})[0];
          expect(destroyCall).toBeDefined();
        });

        it("tolerates unknown taskId", function() {
          expect(function() {
            target.clearTimeout(taskId + 1);
          }).not.toThrow();
        });

      });

      describe("clearInterval", function() {

        beforeEach(function() {
          target.clearInterval(taskId);
        });

        it("calls native cancelTask", function() {
          var cancelCall = nativeBridge.calls({id: createCall.id, op: "call", method: "cancel"})[0];
          expect(cancelCall).toBeDefined();
        });

        it("destroys native timer", function() {
          var destroyCall = nativeBridge.calls({id: createCall.id, op: "destroy"})[0];
          expect(destroyCall).toBeDefined();
        });

        it("tolerates unknown taskId", function() {
          expect(function() {
            target.clearInterval(taskId + 1);
          }).not.toThrow();
        });

      });

    });

    describe("setInterval", function() {

      var delay = 23;
      var taskId;
      var callback;
      var createCall, listenCall, startCall;

      beforeEach(function() {
        callback = jasmine.createSpy("callback");
        taskId = target.setInterval(callback, delay);
        createCall = nativeBridge.calls({op: "create", type: "tabris.Timer"})[0];
        listenCall = nativeBridge.calls({id: createCall.id, op: "listen", event: "Run"})[0];
        startCall = nativeBridge.calls({id: createCall.id, op: "call", method: "start"})[0];
      });

      it("creates native Timer", function() {
        expect(createCall).toBeDefined();
      });

      it("passes arguments to Timer creation", function() {
        expect(createCall.properties.delay).toBe(delay);
        expect(createCall.properties.repeat).toBe(true);
      });

      it("passes 0 delay when argument left out", function() {
        nativeBridge.resetCalls();
        target.setInterval(callback);
        createCall = nativeBridge.calls({op: "create", type: "tabris.Timer"})[0];

        expect(createCall.properties.delay).toBe(0);
      });

      it("passes 0 delay when argument is not a number", function() {
        [1 / 0, NaN, "", {}, false].forEach(function(value) {
          nativeBridge.resetCalls();
          target.setInterval(callback, value);
          createCall = nativeBridge.calls({op: "create", type: "tabris.Timer"})[0];

          expect(createCall.properties.delay).toBe(0);
        });
      });

      it("passes 0 delay when argument is negative", function() {
        nativeBridge.resetCalls();
        target.setInterval(callback, -1);
        createCall = nativeBridge.calls({op: "create", type: "tabris.Timer"})[0];

        expect(createCall.properties.delay).toBe(0);
      });

      it("passes rounded delay", function() {
        nativeBridge.resetCalls();
        target.setInterval(callback, 3.14);
        createCall = nativeBridge.calls({op: "create", type: "tabris.Timer"})[0];

        expect(createCall.properties.delay).toBe(3);
      });

      it("listens on Run event of native Timer", function() {
        expect(listenCall).toBeDefined();
      });

      it("starts the native Timer", function() {
        expect(startCall).toBeDefined();
      });

      it("create, listen, start are called in this order", function() {
        var createPosition = nativeBridge.calls().indexOf(createCall);
        var listenPosition = nativeBridge.calls().indexOf(listenCall);
        var startPosition = nativeBridge.calls().indexOf(startCall);
        expect(listenPosition).toBeGreaterThan(createPosition);
        expect(startPosition).toBeGreaterThan(listenPosition);
      });

      it("returns a number", function() {
        expect(typeof taskId).toBe("number");
      });

      it("returns ascending numbers", function() {
        var nextTaskId = target.setInterval(callback, delay);
        expect(nextTaskId).toBeGreaterThan(taskId);
      });

      it("returned numbers don't clash with getTimeout", function() {
        var timeoutTaskId = target.setTimeout(callback, delay);
        expect(timeoutTaskId).toBeGreaterThan(taskId);
      });

      describe("when notified", function() {

        beforeEach(function() {
          tabris._notify(createCall.id, "Run", {});
        });

        it("callback is called", function() {
          expect(callback).toHaveBeenCalled();
        });

        it("callback is called on subsequent Run events", function() {
          tabris._notify(createCall.id, "Run", {});

          expect(callback.calls.count()).toBe(2);
        });

      });

      describe("clearInterval", function() {

        beforeEach(function() {
          target.clearInterval(taskId);
        });

        it("calls native cancelTask", function() {
          var calls = nativeBridge.calls({id: createCall.id, op: "call", method: "cancel"});
          expect(calls.length).toBe(1);
        });

        it("destroys native timer", function() {
          var destroyCall = nativeBridge.calls({id: createCall.id, op: "destroy"})[0];
          expect(destroyCall).toBeDefined();
        });

        it("tolerates unknown taskId", function() {
          expect(function() {
            target.clearInterval(taskId + 1);
          }).not.toThrow();
        });

      });

    });

  });

});
