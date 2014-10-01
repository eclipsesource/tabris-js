/**
 * Copyright (c) 2014 EclipseSource.
 * All rights reserved.
 */

["Backbone", "tabris"].forEach(function(provider) {
  if (provider in window) {

    describe("Backbone-like Events (" + provider + ")", function() {

      var object;
      var context, context2;
      var callback, callback2;

      beforeEach(function() {
        object = {};
        util.extend(object, window[provider].Events);
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

      });

      describe("off", function() {

        it("should remove callback", function() {
          object.on("foo", callback);
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

        describe("if context is specified", function() {
          beforeEach(function() {
            object.on("foo", callback);
            object.on("foo", callback, context);
            object.on("foo", callback, context2);
            object.off("foo", callback, context);
          });
          it("should remove only the versions of the callback with this contexts", function() {
            object.trigger("foo");
            var callContexts = callback.calls.all().map(function(call) {
              return call.object;
            });
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

      describe("trigger", function() {

        it("should trigger callback", function() {
          object.on("foo", callback);
          object.trigger("foo", 23, 42);
          expect(callback).toHaveBeenCalledWith(23, 42);
          expect(callback.calls.first().object).toBe(object);
        });

        it("should trigger callback with given context", function() {
          object.on("foo", callback, context);
          object.trigger("foo", 23, 42);
          expect(callback).toHaveBeenCalledWith(23, 42);
          expect(callback.calls.first().object).toBe(context);
        });

        it("should return context", function() {
          var result = object.trigger("foo", callback);
          expect(result).toBe(object);
        });

      });

      if (provider === "tabris") {
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
      }

    });

  }
});
