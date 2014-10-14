/**
 * Copyright (c) 2014 EclipseSource.
 * All rights reserved.
 */

describe("ScrollComposite", function() {

  var nativeBridge;
  var parent;

  beforeEach(function() {
    nativeBridge = new NativeBridgeSpy();
    tabris._reset();
    tabris._start(nativeBridge);
    parent = new tabris.Proxy("parent-id");
  });

  describe("when a ScrollComposite is created", function() {
    var scrollComposite, createCalls;
    beforeEach(function() {
      scrollComposite = tabris.create("ScrollComposite", {parent: parent});
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

    describe("append with type and properties", function() {
      var result;

      beforeEach(function() {
        result = scrollComposite.append("Button", {});
      });

      it("sets child's parent to the inner composite", function() {
        var call = nativeBridge.calls({op: "create", type: "rwt.widgets.Button"})[0];
        expect(call.properties.parent).toEqual(scrollComposite._composite.id);
      });

      it("returns self to allow chaining", function() {
        expect(result).toBe(scrollComposite);
      });

    });

    describe("append with proxy", function() {
      var result, child;

      beforeEach(function() {
        child = new tabris.Proxy("child");
        nativeBridge.resetCalls();
        result = scrollComposite.append(child);
      });

      it("sets child's parent to the inner composite", function() {
        var call = nativeBridge.calls({op: "set", id: child.id})[0];
        expect(call.properties.parent).toBe(scrollComposite._composite.id);
      });

      it("returns self to allow chaining", function() {
        expect(result).toBe(scrollComposite);
      });

    });

    describe("when a Scroll listener is added", function() {
      var listener;
      var scrollBar;
      beforeEach(function() {
        listener = jasmine.createSpy();
        scrollBar = tabris(createCalls[1].id);
        scrollComposite.on("scroll", listener);
        spyOn(scrollComposite, "get").and.callFake(function(name) {
          return (name === "origin") ? [23, 42] : null;
        });
      });
      it("is notified on ScrollBar change", function() {
        scrollBar.trigger("selection", {});
        expect(listener).toHaveBeenCalled();
        expect(listener.calls.first().args).toEqual([{x: 23, y: 42}]);
      });
      describe("when another listener is added", function() {
        beforeEach(function() {
          scrollComposite.on("scroll", jasmine.createSpy());
        });
        it("is notified on ScrollBar change once", function() {
          scrollBar.trigger("selection", {});
          expect(listener.calls.count()).toBe(1);
        });
      });
      describe("when the listener is removed", function() {
        beforeEach(function() {
          scrollComposite.off("scroll", listener);
        });
        it("is not notified on ScrollBar change anymore", function() {
          scrollBar.trigger("selection", {});
          expect(listener.calls.count()).toBe(0);
        });
      });
    });

    describe("setting as a parent", function() {
      var child;

      beforeEach(function() {
        child = new tabris.Proxy();
        nativeBridge.resetCalls();
        child.set("parent", scrollComposite);
      });

      it("uses inner composite in 'set'", function() {
        var call = nativeBridge.calls({op: "set", id: child.id})[0];
        expect(call.properties.parent).toBe(scrollComposite._composite.id);
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
