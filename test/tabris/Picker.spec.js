describe("Picker", function() {

  var nativeBridge, picker;

  beforeEach(function() {
    nativeBridge = new NativeBridgeSpy();
    tabris._reset();
    tabris._init(nativeBridge);
    picker = tabris.create("Picker", {});
  });

  describe("creation", function() {

    it("creates combo", function() {
      expect(nativeBridge.calls({op: "create"})[0].type).toEqual("rwt.widgets.Combo");
    });

    it("initializes selectionIndex", function() {
      expect(nativeBridge.calls({op: "create"})[0].properties).toEqual({selectionIndex: 0});
    });

  });

  describe("events:", function() {

    var listener;
    var checkEvent = function(value) {
      expect(listener.calls.count()).toBe(1);
      expect(listener.calls.argsFor(0)[0]).toBe(picker);
      if (arguments.length > 0) {
        expect(listener.calls.argsFor(0)[1]).toEqual(value);
        expect(listener.calls.argsFor(0)[2]).toEqual(arguments[1] || {});
      } else {
        expect(listener.calls.argsFor(0)[1]).toEqual({});
      }
    };
    var checkListen = function(event) {
      var listen = nativeBridge.calls({op: "listen", id: picker.cid});
      expect(listen.length).toBe(1);
      expect(listen[0].event).toBe(event);
      expect(listen[0].listen).toBe(true);
    };

    beforeEach(function() {
      listener = jasmine.createSpy();
    });

    it("Picker select", function() {
      picker.on("select", listener);
      picker.set("items", ["foo", "bar"]);
      tabris._notify(picker.cid, "Selection", {selectionIndex: 1});
      checkEvent("bar", {index: 1});
      checkListen("Selection");
    });

    it("Picker change:selection", function() {
      picker.on("change:selection", listener);
      picker.set("items", ["foo", "bar"]);
      tabris._notify(picker.cid, "Selection", {selectionIndex: 1});
      checkEvent("bar", {index: 1});
      checkListen("Selection");
    });

    it("Picker change:selectionIndex", function() {
      picker.on("change:selectionIndex", listener);
      tabris._notify(picker.cid, "Selection", {selectionIndex: 23});
      checkEvent(23);
      checkListen("Selection");
    });

  });

  describe("properties:", function() {

    beforeEach(function() {
      nativeBridge.resetCalls();
    });

    describe("items", function() {

      it("initial value is empty array", function() {
        expect(picker.get("items")).toEqual([]);
      });

      it("converts null to empty array", function() {
        expect(picker.set("items", null).get("items")).toEqual([]);
      });

      it("converts numbers to string array", function() {
        expect(picker.set("items", [1, 2, 3]).get("items")).toEqual(["1", "2", "3"]);
      });

    });

    describe("selectionIndex", function() {

      it("set SETs selectionIndex", function() {
        picker.set("selectionIndex", 23);

        expect(nativeBridge.calls({op: "set", id: picker.cid})[0].properties).toEqual({selectionIndex: 23});
      });

    });

    it("get GETs selectionIndex", function() {
      spyOn(nativeBridge, "get").and.returnValue(23);

      expect(picker.get("selectionIndex")).toBe(23);
      expect(nativeBridge.get).toHaveBeenCalledWith(picker.cid, "selectionIndex");
    });

    describe("selection", function() {

      it("get returns items entry", function() {
        picker.set("items", ["foo", "bar"]);
        spyOn(nativeBridge, "get").and.returnValue(1);

        expect(picker.get("selection")).toBe("bar");
      });

      it("set SETs selectionIndex", function() {
        picker.set("items", ["foo", "bar"]);

        picker.set("selection", "bar");

        expect(nativeBridge.calls({op: "set", id: picker.cid})[0].properties.selectionIndex).toBe(1);
      });

    });

    it("set together with items SETs selectionIndex", function() {
      picker.set({selection: "bar", items: ["foo", "bar"]});
      expect(nativeBridge.calls({op: "set", id: picker.cid})[0].properties).toEqual({
        selectionIndex: 1,
        items: ["foo", "bar"]
      });
    });

    it("set with unknown value prints warning", function() {
      spyOn(console, "warn");
      picker.set({selection: "bar2"});

      expect(nativeBridge.calls({op: "set", id: picker.cid}).length).toBe(0);
      expect(console.warn).toHaveBeenCalledWith("Could not set picker selection bar2: item not found");
    });

  });

});
