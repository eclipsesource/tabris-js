/**
 * Copyright (c) 2014 EclipseSource.
 * All rights reserved.
 */

describe("ScrollCompositeProxy", function() {

  var nativeBridge;
  var parent;

  beforeEach(function() {
    nativeBridge = new NativeBridgeSpy();
    tabris._reset();
    tabris._start(nativeBridge);
    parent = new tabris.Proxy("parent-id");
  });

  describe("when a ScrollComposite is created", function() {
    var createCalls;
    var scrollComposite;
    beforeEach(function() {
      scrollComposite = parent.append("ScrollComposite", {});
      createCalls = nativeBridge.calls({op: "create"});
    });

    it("creates a vertical ScrolledComposite", function() {
      expect(createCalls[0].type).toBe("rwt.widgets.ScrolledComposite");
      expect(createCalls[0].properties.style).toEqual(["V_SCROLL"]);
    });
    it("creates a vertical ScrollBar", function() {
      expect(createCalls[1].type).toBe("rwt.widgets.ScrollBar");
      expect(createCalls[1].properties.parent).toBe(createCalls[0].id);
      expect(createCalls[1].properties.style).toEqual(["VERTICAL"]);
    });
    it("creates a Composite", function() {
      expect(createCalls[2].type).toBe("rwt.widgets.Composite");
      expect(createCalls[2].properties.parent).toBe(createCalls[0].id);
    });
    it("sets the Composite as content", function() {
      var setCall = nativeBridge.calls({op: "set", id: createCalls[0].id})[0];
      expect(setCall.properties).toEqual({content: createCalls[2].id});
    });

    describe("when a widget is appended to the ScrollComposite", function() {
      var createCalls;
      beforeEach(function() {
        scrollComposite.append("Button", {});
        createCalls = nativeBridge.calls({op: "create"});
      });
      it("is appended to the inner composite", function() {
        expect(createCalls[3].type).toBe("rwt.widgets.Button");
        expect(createCalls[3].properties.parent).toEqual(createCalls[2].id);
      });
    });

    describe("when a Scroll listener is added", function() {
      var listener;
      var scrollBar;
      beforeEach(function() {
        listener = jasmine.createSpy();
        scrollBar = tabris(createCalls[1].id);
        scrollComposite.on("Scroll", listener);
        spyOn(scrollComposite, "get").and.callFake(function(name) {
          return (name === "origin") ? [23, 42] : null;
        });
      });
      it("is notified on ScrollBar change", function() {
        scrollBar.trigger("Selection", {});
        expect(listener).toHaveBeenCalled();
        expect(listener.calls.first().args).toEqual([{x: 23, y: 42}]);
      });
      describe("when another listener is added", function() {
        beforeEach(function() {
          scrollComposite.on("Scroll", jasmine.createSpy());
        });
        it("is notified on ScrollBar change once", function() {
          scrollBar.trigger("Selection", {});
          expect(listener.calls.count()).toBe(1);
        });
      });
      describe("when the listener is removed", function() {
        beforeEach(function() {
          scrollComposite.off("Scroll", listener);
        });
        it("is not notified on ScrollBar change anymore", function() {
          scrollBar.trigger("Selection", {});
          expect(listener.calls.count()).toBe(0);
        });
      });
    });

  });

  describe("when a ScrollComposite is created with scroll='vertical'", function() {
    var createCalls;
    beforeEach(function() {
      parent.append("ScrollComposite", {scroll: "vertical"});
      createCalls = nativeBridge.calls({op: "create"});
    });
    it("the ScrolledComposite is vertical", function() {
      expect(createCalls[0].properties.style).toEqual(["V_SCROLL"]);
    });
    it("the ScrollBar is vertical", function() {
      expect(createCalls[1].properties.style).toEqual(["VERTICAL"]);
    });
  });

  describe("when a ScrollComposite is created with scroll='horizontal'", function() {
    var createCalls;
    beforeEach(function() {
      parent.append("ScrollComposite", {scroll: "horizontal"});
      createCalls = nativeBridge.calls({op: "create"});
    });
    it("the ScrolledComposite is horizontal", function() {
      expect(createCalls[0].properties.style).toEqual(["H_SCROLL"]);
    });
    it("the ScrollBar is horizontal", function() {
      expect(createCalls[1].properties.style).toEqual(["HORIZONTAL"]);
    });
  });

});
