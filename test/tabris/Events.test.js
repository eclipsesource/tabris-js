import {expect, spy, restore} from "../test";
import {extend} from "../../src/tabris/util";
import Events from "../../src/tabris/Events";

describe("Events", function() {

  var object;
  var context, context2;
  var callback, callback2;

  beforeEach(function() {
    object = {};
    extend(object, Events);
    callback = spy();
    callback2 = spy();
    context = {};
    context2 = {};
  });

  afterEach(restore);

  describe("on", function() {

    it("should attach callback", function() {
      object.on("foo", callback);
      object.trigger("foo");
      expect(callback).to.have.been.called;
    });

    it("should return context", function() {
      var result = object.on("foo", callback);
      expect(result).to.equal(object);
    });

    it("should not affect currently processed event", function() {
      object.on("foo", function() {
        object.on("foo", callback);
      });
      object.trigger("foo");
      expect(callback).not.to.have.been.called;
    });

  });

  describe("off", function() {

    it("throws error if no event type is specified", function() {
      expect(() => object.off()).to.throw();
    });

    it("throws error if no event callback is specified", function() {
      expect(() => object.off("foo")).to.throw();
    });

    it("should remove callback", function() {
      object.on("foo", callback);
      object.off("foo", callback);
      object.trigger("foo");
      expect(callback).not.to.have.been.called;
    });

    it("should remove callback registered with once", function() {
      object.once("foo", callback);
      object.off("foo", callback);
      object.trigger("foo");
      expect(callback).not.to.have.been.called;
    });

    it("should remove duplicate callbacks", function() {
      object.on("foo", callback);
      object.on("foo", callback);
      object.off("foo", callback);
      object.trigger("foo");
      expect(callback).not.to.have.been.called;
    });

    it("should not affect currently processed event", function() {
      object.on("foo", function() {
        object.off("foo", callback);
      });
      object.on("foo", callback);
      object.trigger("foo");
      expect(callback).to.have.been.called;
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
        expect(callback.firstCall).to.have.been.calledOn(object);
        expect(callback.secondCall).to.have.been.calledOn(context2);
      });
    });

    describe("if no context is specified", function() {
      beforeEach(function() {
        object.on("foo", callback);
        object.on("foo", callback, context);
        object.on("foo", callback, context2);
        object.off("foo", callback);
      });
      it("should remove only the callback without context", function() {
        object.trigger("foo");
        expect(callback).to.have.been.called.twice;
        expect(callback.firstCall).to.have.been.calledOn(context);
        expect(callback.secondCall).to.have.been.calledOn(context2);
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
        expect(callback).not.to.have.been.called;
        expect(callback2).to.have.been.called;
      });
    });

    it("should return context", function() {
      var result = object.off("foo", callback);
      expect(result).to.equal(object);
    });

  });

  describe("once", function() {

    it("should attach callback", function() {
      object.once("foo", callback);
      object.trigger("foo");
      expect(callback).to.have.been.called;
    });

    it("should forward trigger arguments to wrapped callback", function() {
      object.once("foo", callback);
      object.trigger("foo", 1, 2, 3);
      expect(callback).to.have.been.calledWith(1, 2, 3);
    });

    it("should use given context", function() {
      var context = {};
      object.once("foo", callback, context);
      object.trigger("foo");
      expect(callback.firstCall).to.have.been.calledOn(context);
    });

    it("should return context", function() {
      var result = object.once("foo", callback);
      expect(result).to.equal(object);
    });

    it("should remove callback after trigger", function() {
      object.once("foo", callback);
      object.trigger("foo");
      callback.reset();

      object.trigger("foo");

      expect(callback).not.to.have.been.called;
    });

  });

  describe("trigger", function() {

    it("should trigger callback", function() {
      object.on("foo", callback);
      object.trigger("foo");
      expect(callback).to.have.been.called;
    });

    it("should trigger callback with parameters", function() {
      object.on("foo", callback);
      object.trigger("foo", 23, 42);
      expect(callback).to.have.been.calledWith(23, 42);
    });

    it("should trigger callback with default context", function() {
      object.on("foo", callback);
      object.trigger("foo");
      expect(callback.firstCall).to.have.been.calledOn(object);
    });

    it("should trigger callback with parameters and given context", function() {
      object.on("foo", callback, context);
      object.trigger("foo");
      expect(callback.firstCall).to.have.been.calledOn(context);
    });

    it("should return context", function() {
      var result = object.trigger("foo");
      expect(result).to.equal(object);
    });

  });

  describe("_isListening", function() {

    describe("when no callbacks are attached", function() {
      it("should return false without event type", function() {
        expect(object._isListening()).to.equal(false);
      });
      it("should return false for all event types", function() {
        expect(object._isListening("foo")).to.equal(false);
      });
    });

    describe("when a callback is attached", function() {
      beforeEach(function() {
        object.on("foo", callback);
      });
      it("should return true without event type", function() {
        expect(object._isListening()).to.equal(true);
      });
      it("should return true for the particular event type", function() {
        expect(object._isListening("foo")).to.equal(true);
      });
      it("should return false for other event types", function() {
        expect(object._isListening("bar")).to.equal(false);
      });
    });

    describe("when a callback is attached and removed", function() {
      beforeEach(function() {
        object.on("foo", callback);
        object.off("foo", callback);
      });
      it("should return false without event type", function() {
        expect(object._isListening()).to.equal(false);
      });
      it("should return false for this event type", function() {
        expect(object._isListening("foo")).to.equal(false);
      });
    });
  });

  describe("when attaching events", function() {

    ["on", "once"].forEach(function(method) {

      describe("with " + method + ",", function() {

        describe("callback is triggered multiple times", function() {

          it("when callbacks are not identical", function() {
            object[method]("foo", callback);
            object[method]("foo", callback2);
            object.trigger("foo");
            expect(callback).to.have.been.calledOnce;
            expect(callback2).to.have.been.calledOnce;
          });

          it("when callbacks are identical, but contexts are not", function() {
            object[method]("foo", callback, context);
            object[method]("foo", callback, context2);
            object.trigger("foo");
            expect(callback).to.have.been.calledTwice;
          });

          it("when callbacks are identical, but one of the contexts is not given", function() {
            object[method]("foo", callback, context);
            object[method]("foo", callback);
            object.trigger("foo");
            expect(callback).to.have.been.calledTwice;
          });

        });

        describe("callback is not triggered multiple times", function() {

          it("when callbacks are identical", function() {
            object[method]("foo", callback);
            object[method]("foo", callback);
            object.trigger("foo");
            expect(callback).to.have.been.calledOnce;
          });

          it("when callbacks and contexts are identical", function() {
            object[method]("foo", callback, context);
            object[method]("foo", callback, context);
            object.trigger("foo");
            expect(callback).to.have.been.calledOnce;
          });

        });

      });

    });

  });


});
