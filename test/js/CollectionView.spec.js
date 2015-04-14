describe("CollectionView", function() {

  var consoleBackup = window.console;
  var nativeBridge;
  var parent;

  beforeEach(function() {
    window.console = jasmine.createSpyObj("console", ["log", "info", "warn", "error"]);
    nativeBridge = new NativeBridgeSpy();
    tabris._reset();
    tabris._init(nativeBridge);
    parent = tabris.create("Composite");
    nativeBridge.resetCalls();
  });

  afterEach(function() {
    window.console = consoleBackup;
  });

  describe("when created", function() {
    var view;

    beforeEach(function() {
      view = tabris.create("CollectionView", {background: "yellow"}).appendTo(parent);
    });

    it("creates a native view", function() {
      var createCalls = nativeBridge.calls({op: "create"});
      expect(createCalls.length).toBe(1);
      expect(createCalls[0].type).toBe("tabris.CollectionView");
    });

    it("includes standard properties in native create", function() {
      var createCalls = nativeBridge.calls({op: "create"});
      expect(createCalls[0].properties.background).toEqual([255, 255, 0, 255]);
    });

    it("listens on native events createitem and populateitem", function() {
      expect(nativeBridge.calls({op: "listen", event: "createitem"})[0].listen).toBe(true);
      expect(nativeBridge.calls({op: "listen", event: "populateitem"})[0].listen).toBe(true);
    });

    it("returns default property values", function() {
      expect(view.get("itemHeight")).toBe(0);
      expect(view.get("items", [])).toEqual([]);
      expect(view.get("initializeCell")).toBe(null);
      expect(view.get("refreshEnabled")).toBe(false);
      expect(view.get("refreshIndicator")).toBe(false);
      expect(view.get("refreshMessage")).toBe("");
    });

    describe("when initializeCell is set", function() {

      var initializeCell = jasmine.createSpy("callback");

      beforeEach(function() {
        nativeBridge.resetCalls();
        view.set("initializeCell", initializeCell);
      });

      describe("when items is set", function() {

        var items;

        beforeEach(function() {
          items = ["a", "b", "c"];
          nativeBridge.resetCalls();
          view.set("items", items);
        });

        it("calls native reload with item count", function() {
          var calls = nativeBridge.calls({op: "call", id: view.cid, method: "reload"});
          expect(calls[0].parameters).toEqual({items: 3});
        });

        it("changes to items provided in setter have no effect (defensive copy)", function() {
          items.push("d");

          expect(view.get("items")).toEqual(["a", "b", "c"]);
        });

        it("changes to items returned by getter have no effect (defensive copy)", function() {
          view.get("items").push("d");

          expect(view.get("items")).toEqual(["a", "b", "c"]);
        });

        describe("when items is set again", function() {

          beforeEach(function() {
            nativeBridge.resetCalls();
            view.set("items", ["e", "f"]);
          });

          it("calls native reload with item count", function() {
            var calls = nativeBridge.calls({op: "call", id: view.cid, method: "reload"});
            expect(calls[0].parameters).toEqual({items: 2});
          });

        });

        describe("when items is set to null", function() {

          beforeEach(function() {
            nativeBridge.resetCalls();
            view.set("items", null);
          });

          it("calls native reload with 0", function() {
            var calls = nativeBridge.calls({op: "call", id: view.cid, method: "reload"});
            expect(calls[0].parameters).toEqual({items: 0});
          });

          it("sets items to empty array", function() {
            expect(view.get("items")).toEqual([]);
          });

        });

        describe("when selection event is received", function() {

          var listener;

          beforeEach(function() {
            listener = jasmine.createSpy("listener");
          });

          it("triggers select on the collection view", function() {
            view.on("select", listener);

            view._trigger("selection", {index: 0});

            expect(listener.calls.count()).toBe(1);
            expect(listener.calls.argsFor(0)[0]).toBe(view);
            expect(listener.calls.argsFor(0)[1]).toBe("a");
            expect(listener.calls.argsFor(0)[2]).toEqual({index: 0});
            expect(console.warn).not.toHaveBeenCalled();
          });

        });

        describe("when createitem event is received", function() {

          var cellCreateCall, cell;

          beforeEach(function() {
            view._trigger("createitem");
            cellCreateCall = nativeBridge.calls({op: "create", type: "rwt.widgets.Composite"})[0];
            cell = tabris(cellCreateCall.id);
          });

          it("creates a Cell", function() {
            expect(cellCreateCall).toBeDefined();
            expect(cell).toEqual(jasmine.any(tabris.Cell));
          });

          it("calls native addItem with created cell", function() {
            var addItemCall = nativeBridge.calls({op: "call", id: view.cid, method: "addItem"})[0];
            expect(addItemCall.parameters).toEqual({widget: cell.cid});
          });

          it("calls initializeCell with the cell as parent", function() {
            expect(initializeCell).toHaveBeenCalledWith(cell);
          });

          it("returns cells as children", function() {
            expect(view.children().length).toBe(1);
            expect(view.children()[0]).toBe(cell);
          });

          it("cell has CollectionView as parent", function() {
            expect(cell.parent()).toBe(view);
          });

          it("returns cells as children", function() {
            expect(view.children().length).toBe(1);
            expect(view.children()[0]).toBe(cell);
          });

          it("cell has CollectionView as parent", function() {
            expect(cell.parent()).toBe(view);
          });

          describe("when calling cell.dispose()", function() {

            beforeEach(function() {
              cell.dispose();
            });

            it("cell is not disposed", function() {
              expect(cell.isDisposed()).toBe(false);
            });

            it("a warning is logged", function() {
              var warning = "CollectionView cells are container-managed, they cannot be disposed of";
              expect(console.warn).toHaveBeenCalledWith(warning);
            });

          });

          describe("when view is disposed", function() {

            beforeEach(function() {
              view.dispose();
            });

            it("cells are disposed", function() {
              expect(cell.isDisposed()).toBe(true);
            });

          });

          describe("when populateitem event is received", function() {

            var listener;

            beforeEach(function() {
              listener = jasmine.createSpy("listener");
            });

            it("triggers change:item event on the cell", function() {
              cell.on("change:item", listener);
              view._trigger("populateitem", {widget: cell.cid, index: 0});
              expect(listener).toHaveBeenCalled();
              expect(listener.calls.argsFor(0)[0]).toBe(cell);
              expect(listener.calls.argsFor(0)[1]).toBe("a");
              expect(listener.calls.argsFor(0)[2]).toEqual({});
              expect(cell.get("item")).toBe("a");
              expect(console.warn).not.toHaveBeenCalled();
            });

            it("triggers change:item event on the cell even if item is already set", function() {
              view._trigger("populateitem", {widget: cell.cid, index: 0});
              cell.on("change:item", listener);

              view._trigger("populateitem", {widget: cell.cid, index: 0});

              expect(listener).toHaveBeenCalled();
              expect(listener.calls.argsFor(0)[0]).toBe(cell);
              expect(listener.calls.argsFor(0)[1]).toBe("a");
              expect(listener.calls.argsFor(0)[2]).toEqual({});
              expect(cell.get("item")).toBe("a");
              expect(console.warn).not.toHaveBeenCalled();
            });

            it("triggers change:itemIndex event on the cell", function() {
              cell.on("change:itemIndex", listener);
              view._trigger("populateitem", {widget: cell.cid, index: 0});
              expect(listener).toHaveBeenCalled();
              expect(listener.calls.argsFor(0)[0]).toBe(cell);
              expect(listener.calls.argsFor(0)[1]).toBe(0);
              expect(listener.calls.argsFor(0)[2]).toEqual({});
              expect(cell.get("itemIndex")).toBe(0);
              expect(console.warn).not.toHaveBeenCalled();
            });

          });

        });

      });

    });

  });

  describe("when created with items", function() {

    var view;

    function createCell(item) {
      view._trigger("createitem");
      var createCalls = nativeBridge.calls({op: "create", type: "rwt.widgets.Composite"});
      var cell = tabris(createCalls[createCalls.length - 1].id);
      view._trigger("populateitem", {widget: cell.cid, index: view.get("items").indexOf(item)});
      return cell;
    }

    beforeEach(function() {
      view = tabris.create("CollectionView", {items: ["A", "B", "C"]}).appendTo(parent);
    });

    it("calls reload after create and listen calls", function() {
      var allCalls = nativeBridge.calls({id: view.cid});
      var listen1Call = nativeBridge.calls({op: "listen", event: "createitem", id: view.cid})[0];
      var listen2Call = nativeBridge.calls({op: "listen", event: "populateitem", id: view.cid})[0];
      var reloadCall = nativeBridge.calls({op: "call", method: "reload", id: view.cid})[0];

      expect(allCalls.indexOf(reloadCall)).toBeGreaterThan(allCalls.indexOf(listen1Call));
      expect(allCalls.indexOf(reloadCall)).toBeGreaterThan(allCalls.indexOf(listen2Call));
    });

    describe("insert", function() {
      beforeEach(function() {
        nativeBridge.resetCalls();
      });

      it("can prepend to items array", function() {
        view.insert(["d", "e"], 0);

        expect(view.get("items")).toEqual(["d", "e", "A", "B", "C"]);
      });

      it("can append to items array", function() {
        view.insert(["d", "e"], 3);

        expect(view.get("items")).toEqual(["A", "B", "C", "d", "e"]);
      });

      it("calls native update", function() {
        view.insert(["d", "e"], 1);

        var updateCall = nativeBridge.calls({op: "call", method: "update", id: view.cid})[0];
        expect(updateCall.parameters).toEqual({insert: [1, 2]});
      });

      it("handles single parameter", function() {
        view.insert(["d", "e"]);

        var updateCall = nativeBridge.calls({op: "call", method: "update", id: view.cid})[0];
        expect(updateCall.parameters).toEqual({insert: [3, 2]});
        expect(view.get("items")).toEqual(["A", "B", "C", "d", "e"]);
      });

      it("handles negative index", function() {
        view.insert(["d", "e"], -1);

        var updateCall = nativeBridge.calls({op: "call", method: "update", id: view.cid})[0];
        expect(updateCall.parameters).toEqual({insert: [2, 2]});
        expect(view.get("items")).toEqual(["A", "B", "d", "e", "C"]);
      });

      it("adjusts index to bounds", function() {
        view.insert(["x"], 5);

        var call = nativeBridge.calls({op: "call", method: "update", id: view.cid})[0];
        expect(call.parameters).toEqual({insert: [3, 1]});
        expect(view.get("items")).toEqual(["A", "B", "C", "x"]);
      });

      it("adjusts negative index to bounds", function() {
        view.insert(["x"], -5);

        var call = nativeBridge.calls({op: "call", method: "update", id: view.cid})[0];
        expect(call.parameters).toEqual({insert: [0, 1]});
        expect(view.get("items")).toEqual(["x", "A", "B", "C"]);
      });

      it("fails when index is not a number", function() {
        expect(function() {
          view.insert(["d"], NaN);
        }).toThrow();
      });

      it("fails when items is not an array", function() {
        expect(function() {
          view.insert({});
        }).toThrow();
      });

      it("adjusts cells itemIndex properties", function() {
        view.set("items", ["A", "B", "C", "D", "E"]);
        var a = createCell("A");
        var b = createCell("B");
        var c = createCell("C");
        var d = createCell("D");
        var e = createCell("E");

        view.insert(["X", "Y"], 2);

        expect(a.get("itemIndex")).toBe(0);
        expect(b.get("itemIndex")).toBe(1);
        expect(c.get("itemIndex")).toBe(4);
        expect(d.get("itemIndex")).toBe(5);
        expect(e.get("itemIndex")).toBe(6);
      });

    });

    describe("remove", function() {

      beforeEach(function() {
        nativeBridge.resetCalls();
      });

      it("can remove beginning of items array", function() {
        view.remove(0, 2);

        expect(view.get("items")).toEqual(["C"]);
      });

      it("can remove end of items array", function() {
        view.remove(1, 2);

        expect(view.get("items")).toEqual(["A"]);
      });

      it("calls native update", function() {
        view.remove(1, 2);

        var updateCall = nativeBridge.calls({op: "call", method: "update", id: view.cid})[0];
        expect(updateCall.parameters).toEqual({remove: [1, 2]});
      });

      it("handles single parameter", function() {
        view.remove(1);

        var updateCall = nativeBridge.calls({op: "call", method: "update", id: view.cid})[0];
        expect(updateCall.parameters).toEqual({remove: [1, 1]});
        expect(view.get("items")).toEqual(["A", "C"]);
      });

      it("handles negative index", function() {
        view.remove(-1, 1);

        var updateCall = nativeBridge.calls({op: "call", method: "update", id: view.cid})[0];
        expect(updateCall.parameters).toEqual({remove: [2, 1]});
        expect(view.get("items")).toEqual(["A", "B"]);
      });

      it("ignores index out of bounds", function() {
        view.remove(5, 2);

        var updateCalls = nativeBridge.calls({op: "call", method: "update", id: view.cid});
        expect(updateCalls).toEqual([]);
        expect(view.get("items")).toEqual(["A", "B", "C"]);
      });

      it("ignores negative index out of bounds", function() {
        view.remove(-5, 2);

        var updateCalls = nativeBridge.calls({op: "call", method: "update", id: view.cid});
        expect(updateCalls).toEqual([]);
        expect(view.get("items")).toEqual(["A", "B", "C"]);
      });

      it("repairs count if exceeding", function() {
        view.remove(2, 5);

        var updateCall = nativeBridge.calls({op: "call", method: "update", id: view.cid})[0];
        expect(updateCall.parameters).toEqual({remove: [2, 1]});
        expect(view.get("items")).toEqual(["A", "B"]);
      });

      it("ignores zero count", function() {
        view.remove(2, 0);

        var updateCalls = nativeBridge.calls({op: "call", method: "update", id: view.cid});
        expect(updateCalls).toEqual([]);
        expect(view.get("items")).toEqual(["A", "B", "C"]);
      });

      it("fails when index is not a number", function() {
        expect(function() {
          view.remove(NaN);
        }).toThrow();
      });

      it("fails when count is not a number", function() {
        expect(function() {
          view.remove(0, NaN);
        }).toThrow();
      });

      it("adjusts cells itemIndex properties", function() {
        view.set("items", ["A", "B", "C", "D", "E"]);
        var a = createCell("A");
        var b = createCell("B");
        var c = createCell("C");
        var d = createCell("D");
        var e = createCell("E");

        view.remove(1, 2);

        expect(a.get("itemIndex")).toBe(0);
        expect(b.get("itemIndex")).toBe(1);
        expect(c.get("itemIndex")).toBe(2);
        expect(d.get("itemIndex")).toBe(1);
        expect(e.get("itemIndex")).toBe(2);
      });

    });

    describe("refresh", function() {

      beforeEach(function() {
        nativeBridge.resetCalls();
      });

      it("without parameters calls native update", function() {
        view.refresh();

        var updateCall = nativeBridge.calls({op: "call", method: "update", id: view.cid})[0];
        expect(updateCall.parameters.reload).toEqual([0, 3]);
      });

      it("calls native update", function() {
        view.refresh(1);

        var updateCall = nativeBridge.calls({op: "call", method: "update", id: view.cid})[0];
        expect(updateCall.parameters.reload).toEqual([1, 1]);
      });

      it("accepts negative index", function() {
        view.refresh(-1);

        var updateCall = nativeBridge.calls({op: "call", method: "update", id: view.cid})[0];
        expect(updateCall.parameters.reload).toEqual([2, 1]);
      });

      it("ignores out-of-bounds index", function() {
        view.refresh(5);

        var calls = nativeBridge.calls({op: "call", method: "update", id: view.cid});
        expect(calls).toEqual([]);
      });

      it("fails with invalid parameter", function() {
        expect(function() {
          view.refresh(NaN);
        }).toThrow();
      });

    });

    describe("reveal", function() {

      beforeEach(function() {
        nativeBridge.resetCalls();
      });

      it("calls native reveal with index", function() {
        view.reveal(1);

        var call = nativeBridge.calls({op: "call", method: "reveal", id: view.cid})[0];
        expect(call.parameters).toEqual({index: 1});
      });

      it("accepts negative index", function() {
        view.reveal(-1);

        var call = nativeBridge.calls({op: "call", method: "reveal", id: view.cid})[0];
        expect(call.parameters).toEqual({index: 2});
      });

      it("ignores out-of-bounds index", function() {
        view.reveal(5);

        var calls = nativeBridge.calls({op: "call", method: "reveal", id: view.cid});
        expect(calls).toEqual([]);
      });

      it("fails with invalid parameter", function() {
        expect(function() {
          view.refresh(NaN);
        }).toThrow();
      });

    });

  });

});
