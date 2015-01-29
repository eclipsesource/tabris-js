describe("ScrollComposite", function() {

  var nativeBridge;

  beforeEach(function() {
    nativeBridge = new NativeBridgeSpy();
    tabris._reset();
    tabris._start(nativeBridge);
  });

  describe("when a ScrollComposite is created", function() {
    var scrollComposite, createCalls;
    beforeEach(function() {
      scrollComposite = tabris.create("ScrollComposite", {});
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

    describe("when a child is appended", function() {
      var result, child;

      beforeEach(function() {
        child = new tabris.Proxy("child");
        nativeBridge.resetCalls();
        result = scrollComposite.append(child);
      });

      it("sets child's parent to the inner composite", function() {
        var call = nativeBridge.calls({op: "set", id: child.cid})[0];
        expect(call.properties.parent).toBe(scrollComposite._composite.cid);
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
        spyOn(nativeBridge, "get").and.callFake(function(id, property) {
          if (id === scrollComposite.cid && property === "origin") {
            return [23, 42];
          }
        });
      });

      it("is notified on ScrollBar change", function() {
        scrollBar.trigger("Selection", {});
        expect(listener).toHaveBeenCalled();
        expect(listener.calls.first().args).toEqual([{x: 23, y: 42}]);
      });

      describe("when another listener is added", function() {
        beforeEach(function() {
          scrollComposite.on("scroll", jasmine.createSpy());
        });
        it("is notified on ScrollBar change once", function() {
          scrollBar.trigger("Selection", {});
          expect(listener.calls.count()).toBe(1);
        });
      });

      describe("when the listener is removed", function() {
        beforeEach(function() {
          scrollComposite.off("scroll", listener);
        });
        it("is not notified on ScrollBar change anymore", function() {
          scrollBar.trigger("Selection", {});
          expect(listener.calls.count()).toBe(0);
        });
      });

    });

    describe("appending a widget", function() {
      var child;

      beforeEach(function() {
        child = new tabris.Proxy();
        nativeBridge.resetCalls();
        scrollComposite.append(child);
      });

      it("uses inner composite in 'set'", function() {
        var call = nativeBridge.calls({op: "set", id: child.cid})[0];
        expect(call.properties.parent).toBe(scrollComposite._composite.cid);
      });

    });

  });

  describe("when a ScrollComposite is created with direction='vertical'", function() {
    var createCalls;
    beforeEach(function() {
      tabris.create("ScrollComposite", {direction: "vertical"});
      createCalls = nativeBridge.calls({op: "create"});
    });
    it("the ScrolledComposite is vertical", function() {
      expect(createCalls[0].properties.style).toEqual(["V_SCROLL"]);
    });
    it("the ScrollBar is vertical", function() {
      expect(createCalls[1].properties.style).toEqual(["VERTICAL"]);
    });
  });

  describe("when a ScrollComposite is created with direction='horizontal'", function() {
    var createCalls;
    beforeEach(function() {
      tabris.create("ScrollComposite", {direction: "horizontal"});
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
