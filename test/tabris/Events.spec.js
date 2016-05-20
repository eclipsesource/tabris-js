["Backbone", "tabris"].forEach((provider) => {
  /*globals _:false*/

  describe("Backbone-like Events (" + provider + ")", function() {

    var object;
    var context, context2;
    var callback, callback2;

    beforeEach(function() {
      object = {};
      _.extend(object, window[provider].Events);
      callback = jasmine.createSpy("callback");
      callback2 = jasmine.createSpy("callback");
      context = {};
      context2 = {};
    });

    describe("on", function() {

      it("should attach callback", function() {
        object.on("foo", callback);
        object.trigger("foo");
        expect(callback).toHaveBeenCalled();
      });

      it("should not eliminate duplicate callbacks", function() {
        object.on("foo", callback);
        object.on("foo", callback);
        object.trigger("foo");
        expect(callback.calls.count()).toBe(2);
      });

      it("should return context", function() {
        var result = object.on("foo", callback);
        expect(result).toBe(object);
      });

      it("should not affect currently processed event", function() {
        object.on("foo", function() {
          object.on("foo", callback);
        });
        object.trigger("foo");
        expect(callback).not.toHaveBeenCalled();
      });

    });

    describe("off", function() {

      it("should remove callback", function() {
        object.on("foo", callback);
        object.off("foo", callback);
        object.trigger("foo");
        expect(callback).not.toHaveBeenCalled();
      });

      it("should remove callback registered with once", function() {
        object.once("foo", callback);
        object.off("foo", callback);
        object.trigger("foo");
        expect(callback).not.toHaveBeenCalled();
      });

      it("should remove duplicate callbacks", function() {
        object.on("foo", callback);
        object.on("foo", callback);
        object.off("foo", callback);
        object.trigger("foo");
        expect(callback).not.toHaveBeenCalled();
      });

      it("should not affect currently processed event", function() {
        object.on("foo", function() {
          object.off("foo", callback);
        });
        object.on("foo", callback);
        object.trigger("foo");
        expect(callback).toHaveBeenCalled();
      });

      describe("if context is specified", function() {
        beforeEach(function() {
          object.on("foo", callback);
          object.on("foo", callback, context);
          object.on("foo", callback, context2);
          object.off("foo", callback, context);
        });
        it("should remove only the versions of the callback with this contexts", function() {
          object.trigger("foo");
          var callContexts = callback.calls.all().map(call => call.object);
          expect(callContexts).toEqual([object, context]);
        });
      });

      describe("if no context is specified", function() {
        beforeEach(function() {
          object.on("foo", callback);
          object.on("foo", callback, context);
          object.on("foo", callback, context2);
          object.off("foo", callback);
        });
        it("should remove all versions of the callback with different contexts", function() {
          object.trigger("foo");
          expect(callback).not.toHaveBeenCalled();
        });
      });

      describe("if callback is specified", function() {
        beforeEach(function() {
          object.on("foo", callback);
          object.on("foo", callback2);
          object.off("foo", callback);
        });
        it("should remove only callbacks for the given event type", function() {
          object.trigger("foo");
          expect(callback).not.toHaveBeenCalled();
          expect(callback2).toHaveBeenCalled();
        });
      });

      describe("if no callback is specified", function() {
        beforeEach(function() {
          object.on("foo", callback);
          object.on("foo", callback2);
          object.off("foo");
        });
        it("should remove all callbacks for the event type", function() {
          object.trigger("foo");
          expect(callback).not.toHaveBeenCalled();
          expect(callback2).not.toHaveBeenCalled();
        });
      });

      describe("if no event type is specified", function() {
        beforeEach(function() {
          object.on("foo", callback);
          object.on("bar", callback);
          object.off();
        });
        it("should remove all callbacks for all event types", function() {
          object.trigger("foo");
          object.trigger("bar");
          expect(callback).not.toHaveBeenCalled();
        });
      });

      it("should return context", function() {
        var result = object.off("foo", callback);
        expect(result).toBe(object);
      });

    });

    describe("once", function() {

      it("should attach callback", function() {
        object.once("foo", callback);
        object.trigger("foo");
        expect(callback).toHaveBeenCalled();
      });

      it("should forward trigger arguments to wrapped callback", function() {
        object.once("foo", callback);
        object.trigger("foo", 1, 2, 3);
        expect(callback).toHaveBeenCalledWith(1, 2, 3);
      });

      it("should use given context", function() {
        var context = {};
        object.once("foo", callback, context);
        object.trigger("foo");
        expect(callback.calls.first().object).toBe(context);
      });

      it("should not eliminate duplicate callbacks", function() {
        object.once("foo", callback);
        object.once("foo", callback);
        object.trigger("foo");
        expect(callback.calls.count()).toBe(2);
      });

      it("should return context", function() {
        var result = object.once("foo", callback);
        expect(result).toBe(object);
      });

      it("should remove callback after trigger", function() {
        object.once("foo", callback);
        object.trigger("foo");
        callback.calls.reset();

        object.trigger("foo");

        expect(callback).not.toHaveBeenCalled();
      });

    });

    describe("trigger", function() {

      it("should trigger callback", function() {
        object.on("foo", callback);
        object.trigger("foo");
        expect(callback).toHaveBeenCalled();
      });

      it("should trigger callback with parameters", function() {
        object.on("foo", callback);
        object.trigger("foo", 23, 42);
        expect(callback).toHaveBeenCalledWith(23, 42);
      });

      it("should trigger callback with default context", function() {
        object.on("foo", callback);
        object.trigger("foo");
        expect(callback.calls.first().object).toBe(object);
      });

      it("should trigger callback with parameters and given context", function() {
        object.on("foo", callback, context);
        object.trigger("foo");
        expect(callback.calls.first().object).toBe(context);
      });

      it("should return context", function() {
        var result = object.trigger("foo");
        expect(result).toBe(object);
      });

    });

    if (provider === "tabris") {

      // Tabris.js specific API only

      describe("_isListening", function() {

        describe("when no callbacks are attached", function() {
          it("should return false without event type", function() {
            expect(object._isListening()).toBe(false);
          });
          it("should return false for all event types", function() {
            expect(object._isListening("foo")).toBe(false);
          });
        });

        describe("when a callback is attached", function() {
          beforeEach(function() {
            object.on("foo", callback);
          });
          it("should return true without event type", function() {
            expect(object._isListening()).toBe(true);
          });
          it("should return true for the particular event type", function() {
            expect(object._isListening("foo")).toBe(true);
          });
          it("should return false for other event types", function() {
            expect(object._isListening("bar")).toBe(false);
          });
        });

        describe("when a callback is attached and removed", function() {
          beforeEach(function() {
            object.on("foo", callback);
            object.off("foo", callback);
          });
          it("should return false without event type", function() {
            expect(object._isListening()).toBe(false);
          });
          it("should return false for this event type", function() {
            expect(object._isListening("foo")).toBe(false);
          });
        });
      });

      describe("_isDisposed", function() {

        it("prevents callbacks from being triggered", function() {
          object.on("foo", callback);
          object._on("foo", callback);

          object._isDisposed = true;
          object.trigger("foo");

          expect(callback).not.toHaveBeenCalled();
        });

      });

      describe("_checkDisposed", function() {

        beforeEach(function() {
          spyOn(object, "_checkDisposed");
        });

        it("is called for 'on'", function() {
          object.on("foo", function() {});
          expect(object._checkDisposed).toHaveBeenCalled();
        });

        it("is called for 'off'", function() {
          object.off("foo");
          expect(object._checkDisposed).toHaveBeenCalled();
        });

        it("is called for 'once'", function() {
          object.once("foo", function() {});
          expect(object._checkDisposed).toHaveBeenCalled();
        });

        it("is not called for 'trigger'", function() {
          object.trigger("foo");
          expect(object._checkDisposed).not.toHaveBeenCalled();
        });

        it("is not called inside 'once' when disposed during event processing", function() {
          // See #531
          object._checkDisposed.and.callFake(function() {
            expect(this._isDisposed).toBeFalsy();
          });
          callback.and.callFake(function() {
            this._isDisposed = true;
          });
          object.once("foo", callback);
          object.once("foo", callback);

          object.trigger("foo", callback);

          expect(callback.calls.count()).toBe(2);
        });

      });

      describe("_on", function() {

        it("registers listener that can not be removed with off", function() {
          object._on("foo", callback, context);

          object.off("foo", callback, context);
          object.off("foo", callback);
          object.off("foo");
          object.off();
          object.trigger("foo", "argument");

          expect(object._isListening("foo")).toBe(true);
          expect(callback).toHaveBeenCalledWith("argument");
        });

        it("registers listener that can be removed with _off", function() {
          object._on("foo", callback, context);

          object._off("foo", callback, context);
          object.trigger("foo", "argument");

          expect(object._isListening("foo")).toBe(false);
          expect(callback).not.toHaveBeenCalled();
        });

      });

    }

  });

});
