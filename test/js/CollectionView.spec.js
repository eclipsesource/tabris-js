describe("CollectionView", function() {

  var consoleBackup = window.console;
  var nativeBridge;
  var parent;

  beforeEach(function() {
    window.console = jasmine.createSpyObj("console", ["log", "info", "warn", "error"]);
    nativeBridge = new NativeBridgeSpy();
    tabris._reset();
    tabris._start(nativeBridge);
    parent = new tabris.Proxy("parent-id");
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

    describe("when initializeCell is set", function() {

      var initializeCell = jasmine.createSpy("callback");

      beforeEach(function() {
        nativeBridge.resetCalls();
        view.set("initializeCell", initializeCell);
      });

      describe("when items is set", function() {

        beforeEach(function() {
          nativeBridge.resetCalls();
          view.set("items", ["a", "b", "c"]);
        });

        it("calls native update with insert", function() {
          var calls = nativeBridge.calls({op: "call", id: view.id, method: "update"});
          expect(calls[0].parameters).toEqual({insert: [0, 3]});
        });

        describe("when items is set again", function() {

          beforeEach(function() {
            nativeBridge.resetCalls();
            view.set("items", ["e", "f"]);
          });

          it("calls native update with remove and insert", function() {
            var calls = nativeBridge.calls({op: "call", id: view.id, method: "update"});
            expect(calls[0].parameters).toEqual({remove: [0, 3], insert: [0, 2]});
          });

        });

        describe("when items is set to null", function() {

          beforeEach(function() {
            nativeBridge.resetCalls();
            view.set("items", null);
          });

          it("calls native update with remove", function() {
            var calls = nativeBridge.calls({op: "call", id: view.id, method: "update"});
            expect(calls[0].parameters).toEqual({remove: [0, 3]});
          });

        });

        describe("when selection event is received", function() {

          var listener;

          beforeEach(function() {
            listener = jasmine.createSpy("listener");
            view.on("selection", listener);
            view._trigger("selection", {index: 0});
          });

          it("triggers selection on the collection view", function() {
            expect(listener).toHaveBeenCalledWith({index: 0, item: "a"});
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
            expect(cell).toEqual(jasmine.any(tabris._CollectionCell));
          });

          it("creates a Cell and calls native addItem", function() {
            var addItemCall = nativeBridge.calls({op: "call", id: view.id, method: "addItem"})[0];
            expect(addItemCall.parameters).toEqual({widget: cell.id});
          });

          it("calls initializeCell with the cell as parent", function() {
            expect(initializeCell).toHaveBeenCalledWith(cell);
          });

          it("cell cannot be disposed", function() {
          });

          describe("when calling cell.dipose()", function() {

            beforeEach(function() {
              cell.dispose();
            });

            it("cell is not disposed", function() {
              cell.get("foo"); // does not throw widget disposed
            });

            it("a warning is logged", function() {
              var warning = "CollectionView cells are container-managed, they cannot be disposed of";
              expect(console.warn).toHaveBeenCalledWith(warning);
            });

          });

          describe("when populateitem event is received", function() {

            var listener;

            beforeEach(function() {
              listener = jasmine.createSpy("listener");
              cell.on("itemchange", listener);
              view._trigger("populateitem", {widget: cell.id, index: 0});
            });

            it("triggers itemchange event on the cell", function() {
              expect(listener).toHaveBeenCalledWith("a", 0);
            });

          });

        });

      });

    });

  });

  describe("when created with items", function() {

    var view;

    beforeEach(function() {
      view = tabris.create("CollectionView", {items: [1, 2, 3]}).appendTo(parent);
    });

    it("calls update after create and listen calls", function() {
      var allCalls = nativeBridge.calls({id: view.id});
      var listen1Call = nativeBridge.calls({op: "listen", event: "createitem", id: view.id})[0];
      var listen2Call = nativeBridge.calls({op: "listen", event: "populateitem", id: view.id})[0];
      var updateCall = nativeBridge.calls({op: "call", method: "update", id: view.id})[0];

      expect(allCalls.indexOf(updateCall)).toBeGreaterThan(allCalls.indexOf(listen1Call));
      expect(allCalls.indexOf(updateCall)).toBeGreaterThan(allCalls.indexOf(listen2Call));
    });

  });

});
