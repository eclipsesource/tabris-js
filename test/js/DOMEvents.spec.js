/**
 * Copyright (c) 2014 EclipseSource.
 * All rights reserved.
 */

describe("DOMEvents", function() {

  var target;
  var listener;

  beforeEach(function () {
    target = {};
    tabris._addEventTargetMethods(target);
    listener = jasmine.createSpy();
  });

  describe("Event constructor", function() {

    it("sets default values", function() {
      var event = new tabris.Event("type");
      expect(event.NONE).toBe(0);
      expect(event.CAPTURING_PHASE).toBe(1);
      expect(event.AT_TARGET).toBe(2);
      expect(event.BUBBLING_PHASE).toBe(3);
      expect(event.target).toBe(null);
      expect(event.currentTarget).toBe(null);
      expect(event.eventPhase).toBe(0);
      expect(event.bubbles).toBe(false);
      expect(event.cancelable).toBe(false);
      expect(event.defaultPrevented).toBe(false);
      expect(event.isTrusted).toBe(false);
      expect(event.stopPropagation).toEqual(jasmine.any(Function));
      expect(event.stopImmediatePropagation).toEqual(jasmine.any(Function));
      expect(event.preventDefault).toEqual(jasmine.any(Function));
    });

    it("sets type from parameter", function() {
      var event = new tabris.Event("type");
      expect(event.type).toBe("type");
    });

    it("sets values from eventInitDict parameter", function() {
      var event = new tabris.Event("type", {bubbles: true, cancelable: true});
      expect(event.bubbles).toBe(true);
      expect(event.cancelable).toBe(true);
    });

  });

  describe("addEventTargetMethods", function() {

    it("adds methods to target", function() {
      expect(typeof target.addEventListener).toBe("function");
      expect(target.removeEventListener).toEqual(jasmine.any(Function));
      expect(typeof target.dispatchEvent).toBe("function");
    });

    it("does not overwrite existing window methods", function() {
      var addEventListener = target.addEventListener;
      var removeEventListener = target.removeEventListener;
      var dispatchEvent = target.dispatchEvent;

      tabris._addEventTargetMethods(target);

      expect(target.addEventListener).toBe(addEventListener);
      expect(target.removeEventListener).toBe(removeEventListener);
      expect(target.dispatchEvent).toBe(dispatchEvent);
    });

    describe("when listener is added", function() {

      beforeEach(function () {
        target.addEventListener("foo", listener);
      });

      it("it is notified for Events with same type", function() {
        var event = {type: "foo"};
        target.dispatchEvent(event);
        expect(listener).toHaveBeenCalledWith(event);
      });

      it("it is not notified for Events with different type", function() {
        var event = {type: "bar"};
        target.dispatchEvent(event);
        expect(listener).not.toHaveBeenCalled();
      });

      describe("and removed", function() {

        beforeEach(function () {
          target.removeEventListener("foo", listener);
        });

        it("it is not notified anymore", function() {
          var event = {type: "foo"};
          target.dispatchEvent(event);
          expect(listener).not.toHaveBeenCalled();
        });
      });

      describe("and added again", function() {

        beforeEach(function () {
          target.addEventListener("foo", listener);
        });

        it("it is notified only once", function() {
          var event = {type: "foo"};
          target.dispatchEvent(event);
          expect(listener.calls.count()).toBe(1);
        });

        describe("and removed once", function() {

          beforeEach(function () {
            target.removeEventListener("foo", listener);
          });

          it("it is not notified anymore", function() {
            var event = {type: "foo"};
            target.dispatchEvent(event);
            expect(listener).not.toHaveBeenCalled();
          });

        });

      });

    });

  });

});