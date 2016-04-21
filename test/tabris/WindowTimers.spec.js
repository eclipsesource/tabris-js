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

  describe("created methods:", function() {

    var delay = 23;
    var taskId;
    var callback;
    var createCall = function() { return nativeBridge.calls({op: "create", type: "tabris.Timer"})[0]; };
    var listenCall = function() { return nativeBridge.calls({id: createCall().id, op: "listen", event: "Run"})[0]; };
    var startCall = function() { return nativeBridge.calls({id: createCall().id, op: "call", method: "start"})[0]; };

    beforeEach(function() {
      tabris._addWindowTimerMethods(target);
      callback = jasmine.createSpy("callback");
    });

    ["setTimeout", "setInterval"].forEach((method) => {

      var isInterval = method === "setInterval";

      describe(method, function() {

        describe("when called with delay", function() {

          beforeEach(function() {
            taskId = target[method](callback, delay);
          });

          it("creates native Timer", function() {
            expect(createCall()).toBeDefined();
          });

          it("passes arguments to Timer creation", function() {
            expect(createCall().properties.delay).toBe(delay);
            expect(createCall().properties.repeat).toBe(isInterval);
          });

          it("listens on Run event of native Timer", function() {
            expect(listenCall()).toBeDefined();
          });

          it("starts the native Timer", function() {
            expect(startCall()).toBeDefined();
          });

          it("create, listen, start are called in this order", function() {
            var createPosition = nativeBridge.calls().indexOf(createCall());
            var listenPosition = nativeBridge.calls().indexOf(listenCall());
            var startPosition = nativeBridge.calls().indexOf(startCall());
            expect(listenPosition).toBeGreaterThan(createPosition);
            expect(startPosition).toBeGreaterThan(listenPosition);
          });

          it("returns a number", function() {
            expect(typeof taskId).toBe("number");
          });

          it("returns ascending numbers", function() {
            var nextTaskId = target[method](callback, 23);
            expect(nextTaskId).toBeGreaterThan(taskId);
          });

          it("returned numbers don't clash with other method", function() {
            var otherMethod = isInterval ? "setTimeout" : "setInterval";
            var timeoutTaskId = target[otherMethod](callback, delay);
            expect(timeoutTaskId).toBeGreaterThan(taskId);
          });

          describe("and timer is notified, ", function() {

            beforeEach(function() {
              tabris._notify(createCall().id, "Run", {});
            });

            it("callback is called", function() {
              expect(callback).toHaveBeenCalled();
            });

            if (isInterval) {
              it("timer is not disposed", function() {
                var destroyCall = nativeBridge.calls({id: createCall().id, op: "destroy"})[0];
                expect(destroyCall).not.toBeDefined();
              });
            } else {
              it("timer is disposed", function() {
                var destroyCall = nativeBridge.calls({id: createCall().id, op: "destroy"})[0];
                expect(destroyCall).toBeDefined();
              });
            }

          });

          ["clearTimeout", "clearInterval"].forEach((clearMethod) => {

            describe("and " + clearMethod + " is called", function() {

              beforeEach(function() {
                target[clearMethod](taskId);
              });

              it("calls native cancelTask", function() {
                var cancelCall = nativeBridge.calls({id: createCall().id, op: "call", method: "cancel"})[0];
                expect(cancelCall).toBeDefined();
              });

              it("destroys native timer", function() {
                var destroyCall = nativeBridge.calls({id: createCall().id, op: "destroy"})[0];
                expect(destroyCall).toBeDefined();
              });

              it("tolerates unknown taskId", function() {
                expect(() => {
                  target.clearInterval(taskId + 1);
                }).not.toThrow();
              });

            });

          });

        });

        it("creates native Timer when tabris is being started", function() {
          tabris._ready = false;
          taskId = target[method](callback, delay);

          tabris._init(nativeBridge);

          expect(createCall()).toBeDefined();
        });

        it("passes 0 delay when argument is left out", function() {
          target[method](callback);

          expect(createCall().properties.delay).toBe(0);
        });

        it("passes 0 delay when argument is not a number", function() {
          [1 / 0, NaN, "", {}, false].forEach((value) => {
            nativeBridge.resetCalls();
            target[method](callback, value);

            expect(createCall().properties.delay).toBe(0);
          });
        });

        it("passes 0 delay when argument is negative", function() {
          target[method](callback, -1);

          expect(createCall().properties.delay).toBe(0);
        });

        it("passes rounded delay", function() {
          target[method](callback, 3.14);

          expect(createCall().properties.delay).toBe(3);
        });

        it("passes zero parameters to callback", function() {
          target[method](callback, delay);
          tabris._notify(createCall().id, "Run", {});

          expect(callback).toHaveBeenCalledWith();
        });

        it("passes one parameter to callback", function() {
          target[method](callback, delay, 1);
          tabris._notify(createCall().id, "Run", {});

          expect(callback).toHaveBeenCalledWith(1);
        });

        it("passes four parameter to callback", function() {
          target[method](callback, delay, 1, 2, 3, 4);
          tabris._notify(createCall().id, "Run", {});

          expect(callback).toHaveBeenCalledWith(1, 2, 3, 4);
        });

      });

    });

  });

});
