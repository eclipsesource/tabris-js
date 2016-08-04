describe("ScrollView", function() {

  var nativeBridge;

  beforeEach(function() {
    nativeBridge = new NativeBridgeSpy();
    tabris._reset();
    tabris._init(nativeBridge);
  });

  describe("when a ScrollView is created", function() {
    var scrollView, createCalls;

    beforeEach(function() {
      scrollView = new tabris.ScrollView();
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
      expect(createCalls[2].type).toBe("tabris.Composite");
      expect(createCalls[2].properties.parent).toBe(createCalls[0].id);
    });

    it("sets the Composite as content", function() {
      var setCall = nativeBridge.calls({op: "set", id: createCalls[0].id})[0];
      expect(setCall.properties).toEqual({content: createCalls[2].id});
    });

    describe("when a child is appended", function() {
      var result, child;

      beforeEach(function() {
        child = new tabris.Composite();
        nativeBridge.resetCalls();
        result = scrollView.append(child);
      });

      it("sets child's parent to the inner composite", function() {
        var call = nativeBridge.calls({op: "set", id: child.cid})[0];
        expect(call.properties.parent).toBe(scrollView._composite.cid);
      });

      it("returns self to allow chaining", function() {
        expect(result).toBe(scrollView);
      });

    });

    describe("when a Scroll listener is added", function() {
      var listener;
      var scrollBar;

      beforeEach(function() {
        listener = jasmine.createSpy();
        scrollBar = tabris(createCalls[1].id);
        scrollView.on("scroll", listener);
        spyOn(nativeBridge, "get").and.callFake(function(id, property) {
          if (id === scrollView.cid && property === "origin") {
            return [23, 42];
          }
        });
      });

      it("is notified on ScrollBar change", function() {
        scrollBar.trigger("Selection", {});
        expect(listener).toHaveBeenCalled();
        expect(listener.calls.first().args[0]).toBe(scrollView);
        expect(listener.calls.first().args[1]).toEqual({x: 23, y: 42});
      });

      describe("when another listener is added", function() {

        beforeEach(function() {
          scrollView.on("scroll", jasmine.createSpy());
        });

        it("is notified on ScrollBar change once", function() {
          scrollBar.trigger("Selection", {});
          expect(listener.calls.count()).toBe(1);
        });

      });

      describe("when the listener is removed", function() {

        beforeEach(function() {
          scrollView.off("scroll", listener);
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
        child = new tabris.Composite();
        nativeBridge.resetCalls();
        scrollView.append(child);
      });

      it("uses inner composite in 'set'", function() {
        var call = nativeBridge.calls({op: "set", id: child.cid})[0];
        expect(call.properties.parent).toBe(scrollView._composite.cid);
      });

    });

  });

  describe("when created with direction 'vertical'", function() {

    var scrollView, createCalls;

    beforeEach(function() {
      scrollView = new tabris.ScrollView({direction: "vertical"});
      createCalls = nativeBridge.calls({op: "create"});
      nativeBridge.resetCalls();
    });

    it("creates a vertical ScrolledComposite", function() {
      expect(createCalls[0].properties.style).toEqual(["V_SCROLL"]);
    });

    it("creates a vertical ScrollBar", function() {
      expect(createCalls[1].properties.style).toEqual(["VERTICAL"]);
    });

    it("direction is 'vertical'", function() {
      expect(scrollView.get("direction")).toEqual("vertical");
    });

    it("scrollY is taken from native, scrollX is 0", function() {
      spyOn(nativeBridge, "get").and.returnValue([23, 42]);
      expect(scrollView.get("scrollX")).toBe(0);
      expect(scrollView.get("scrollY")).toBe(42);
    });

    it("scrollY can be set", function() {
      scrollView.set("scrollY", 23);

      var setCalls = nativeBridge.calls({id: scrollView.cid, op: "set"});

      expect(setCalls[0].properties.origin).toEqual([0, 23]);
    });

    it("ignores setting scrollX", function() {
      scrollView.set("scrollX", 23);

      var setCalls = nativeBridge.calls({id: scrollView.cid, op: "set"});

      expect(setCalls.length).toBe(0);
    });

  });

  describe("when created with direction 'horizontal'", function() {

    var scrollView, createCalls;

    beforeEach(function() {
      scrollView = new tabris.ScrollView({direction: "horizontal"});
      createCalls = nativeBridge.calls({op: "create"});
      nativeBridge.resetCalls();
    });

    it("creates a horizontal ScrolledComposite", function() {
      expect(createCalls[0].properties.style).toEqual(["H_SCROLL"]);
    });

    it("creates a horizontal ScrollBar", function() {
      expect(createCalls[1].properties.style).toEqual(["HORIZONTAL"]);
    });

    it("direction is 'horizontal'", function() {
      expect(scrollView.get("direction")).toBe("horizontal");
    });

    it("scrollX is taken from native, scrollY is 0", function() {
      spyOn(nativeBridge, "get").and.returnValue([23, 42]);
      expect(scrollView.get("scrollX")).toBe(23);
      expect(scrollView.get("scrollY")).toBe(0);
    });

    it("scrollX can be set", function() {
      scrollView.set("scrollX", 23);

      var setCalls = nativeBridge.calls({id: scrollView.cid, op: "set"});

      expect(setCalls[0].properties.origin).toEqual([23, 0]);
    });

    it("ignores setting scrollY", function() {
      scrollView.set("scrollY", 23);

      var setCalls = nativeBridge.calls({id: scrollView.cid, op: "set"});

      expect(setCalls.length).toBe(0);
    });

  });

  describe("when created without direction", function() {

    var scrollView, createCalls;

    beforeEach(function() {
      scrollView = new tabris.ScrollView();
      createCalls = nativeBridge.calls({op: "create"});
    });

    it("creates a vertical ScrolledComposite", function() {
      expect(createCalls[0].properties.style).toEqual(["V_SCROLL"]);
    });

    it("creates a vertical ScrollBar", function() {
      expect(createCalls[1].properties.style).toEqual(["VERTICAL"]);
    });

    it("direction is 'vertical'", function() {
      expect(scrollView.get("direction")).toEqual("vertical");
    });

  });

});
