import {expect, spy, stub, restore, match} from "../../test";
import ProxyStore from "../../../src/tabris/ProxyStore";
import NativeBridge from "../../../src/tabris/NativeBridge";
import ClientStub from "../ClientStub";
import CollectionView from "../../../src/tabris/widgets/CollectionView";
import Composite from "../../../src/tabris/widgets/Composite";
import Cell from "../../../src/tabris/widgets/Cell";

describe("CollectionView", function() {

  let client;
  let parent;

  beforeEach(function() {
    client = new ClientStub();
    global.tabris = {
      on: () => {},
      _proxies: new ProxyStore(),
      _notify: (cid, event, param) => tabris._proxies.find(cid)._trigger(event, param)
    };
    global.tabris._nativeBridge = new NativeBridge(client);
    parent = new Composite();
    client.resetCalls();
  });

  afterEach(restore);

  describe("when created", function() {
    let view;

    beforeEach(function() {
      view = new CollectionView({background: "yellow"}).appendTo(parent);
    });

    it("creates a native view", function() {
      let createCalls = client.calls({op: "create"});
      expect(createCalls.length).to.equal(1);
      expect(createCalls[0].type).to.equal("tabris.CollectionView");
    });

    it("includes standard properties in native create", function() {
      let createCalls = client.calls({op: "create"});
      expect(createCalls[0].properties.background).to.eql([255, 255, 0, 255]);
    });

    it("listens on native events `requestinfo`, `createitem`, and `populateitem`", function() {
      expect(client.calls({op: "listen", event: "requestinfo"})[0].listen).to.equal(true);
      expect(client.calls({op: "listen", event: "createitem"})[0].listen).to.equal(true);
      expect(client.calls({op: "listen", event: "populateitem"})[0].listen).to.equal(true);
    });

    it("returns default property values", function() {
      expect(view.get("itemHeight")).to.equal(0);
      expect(view.get("items", [])).to.eql([]);
      expect(view.get("initializeCell")).to.equal(null);
      expect(view.get("cellType")).to.equal(null);
      expect(view.get("refreshEnabled")).to.equal(false);
      expect(view.get("refreshMessage")).to.equal("");
    });

    describe("refreshIndicator", function() {

      it("calls native GET", function() {
        stub(client, "get").returns(false);

        expect(view.get("refreshIndicator")).to.equal(false);
      });

    });

    ["firstVisibleIndex", "lastVisibleIndex"].forEach((prop) => {

      describe(prop, function() {

        it("GETs property from client", function() {
          stub(client, "get").returns(23);

          let result = view.get(prop);

          expect(result).to.equal(23);
          expect(client.get).to.have.been.called;
        });

        it("prevents setting the property", function() {
          spy(console, "warn");
          spy(client, "set");

          view.set(prop, 23);

          expect(client.set).to.have.not.been.called;
          expect(console.warn).to.have.been.called;
          expect(console.warn).to.have.been.calledWith(match("Cannot set read-only property '" + prop + "'"));
        });

      });

      let changeEvent = "change:" + prop;

      describe(changeEvent, function() {

        it("issues native listen once", function() {
          let listener = spy();

          view.on(changeEvent, listener);
          view.on(changeEvent, listener);

          expect(client.calls({op: "listen", id: view.cid, event: "scroll"}).length).to.equal(1);
        });

        it("listener is notified once for every new index", function() {
          let listener = spy();
          let index = 23;
          view.on(changeEvent, listener);
          stub(client, "get", () => index);

          view._trigger("scroll", {});
          view._trigger("scroll", {});
          view._trigger("scroll", {});
          index = 24;
          view._trigger("scroll", {});
          view._trigger("scroll", {});

          expect(listener).to.have.been.calledTwice;
          expect(listener.firstCall).to.have.been.calledWith(view, 23, {});
          expect(listener.secondCall).to.have.been.calledWith(view, 24, {});
        });

        it("listener is notified once even if other listeners are attached", function() {
          let listener = spy();
          view.on(changeEvent, listener);
          view.on(changeEvent, function() {});
          stub(client, "get").returns(23);

          view._trigger("scroll", {});

          expect(listener).to.have.been.calledOnce;
        });

        it("listener is notified once after on-off-on", function() {
          let listener = spy();
          view.on(changeEvent, listener);
          view.off(changeEvent, listener);
          view.on(changeEvent, listener);
          stub(client, "get").returns(23);

          view._trigger("scroll", {});

          expect(listener).to.have.been.calledOnce;
        });

      });

    });

    describe("when cellType is set to a function", function() {

      let cellTypeFn = spy();

      beforeEach(function() {
        client.resetCalls();
        spy(client, "set");
        view.set("cellType", cellTypeFn);
        tabris._nativeBridge.flush();
      });

      it("returns the given function", function() {
        expect(view.get("cellType")).to.equal(cellTypeFn);
      });

      it("does not SET native property", function() {
        expect(client.set).to.have.not.been.called;
      });

    });

    describe("when cellType is set to a string", function() {

      beforeEach(function() {
        client.resetCalls();
        spy(client, "set");
        view.set("cellType", "foo");
        tabris._nativeBridge.flush();
      });

      it("returns the given string", function() {
        expect(view.get("cellType")).to.equal("foo");
      });

      it("does not SET native property", function() {
        expect(client.set).to.have.not.been.called;
      });

    });

    describe("when itemHeight is set to a function", function() {

      let itemHeightFn = spy();

      beforeEach(function() {
        client.resetCalls();
        spy(client, "set");
        view.set("itemHeight", itemHeightFn);
        tabris._nativeBridge.flush();
      });

      it("returns the given function", function() {
        expect(view.get("itemHeight")).to.equal(itemHeightFn);
      });

      it("does not SET native property", function() {
        expect(client.set).to.have.not.been.called;
      });

    });

    describe("when itemHeight is set to a number", function() {

      beforeEach(function() {
        client.resetCalls();
        view.set("itemHeight", 23);
        tabris._nativeBridge.flush();
      });

      it("returns the given number", function() {
        expect(view.get("itemHeight")).to.equal(23);
      });

      it("SETs native property", function() {
        let calls = client.calls({op: "set"});
        expect(calls[0].properties.itemHeight).to.equal(23);
      });

    });

    describe("when initializeCell is set", function() {

      let initializeCell;

      beforeEach(function() {
        initializeCell = spy();
        client.resetCalls();
        view.set("initializeCell", initializeCell);
      });

      it("returns same function in get", function() {
        expect(view.get("initializeCell")).to.equal(initializeCell);
      });

      it("does not SET property on client", function() {
        expect(client.calls({op: "set", id: view.cid}).length).to.equal(0);
      });

      describe("when items is set", function() {

        let items;

        beforeEach(function() {
          items = ["a", "b", "c"];
          client.resetCalls();
          view.set("items", items);
        });

        it("calls native reload with item count", function() {
          let calls = client.calls({op: "call", id: view.cid, method: "reload"});
          expect(calls[0].parameters).to.eql({items: 3});
        });

        it("items are kept by reference (no defensive copy)", function() {
          expect(view.get("items")).to.equal(items);
        });

        describe("when requestinfo event is received", function() {

          let cellTypeFn, itemHeightFn, describeCalls;

          beforeEach(function() {
            cellTypeFn = spy(function(item) {
              return item.charCodeAt(0) % 2 === 0 ? "bar" : "foo";
            });
            itemHeightFn = spy(function(item) {
              return item.charCodeAt(0) % 2 === 0 ? 80 : 50;
            });
          });

          describe("when cellType is set to a function", function() {

            beforeEach(function() {
              view.set("cellType", cellTypeFn);
              view.set("itemHeight", 50);
              tabris._nativeBridge.flush();
              view._trigger("requestinfo", {index: 0});
              view._trigger("requestinfo", {index: 1});
              view._trigger("requestinfo", {index: 2});
              describeCalls = client.calls({op: "call", method: "describeItem"});
            });

            it("executes `cellType` function", function() {
              expect(cellTypeFn).to.have.been.calledWith("a");
              expect(cellTypeFn).to.have.been.calledWith("b");
              expect(cellTypeFn).to.have.been.calledWith("c");
            });

            it("CALLs `describeItem` with index, type, and fixed height", function() {
              expect(describeCalls[0].parameters).to.eql({index: 0, type: 0, height: 50});
              expect(describeCalls[1].parameters).to.eql({index: 1, type: 1, height: 50});
              expect(describeCalls[2].parameters).to.eql({index: 2, type: 0, height: 50});
            });

            describe("when createitem event is received with item type", function() {

              beforeEach(function() {
                view._trigger("createitem", {type: 0});
              });

              it("calls `initializeCell` function with cell type", function() {
                expect(initializeCell).to.have.been.calledWith(match.instanceOf(Cell), "foo");
              });

            });

          });

          describe("when cellType is set to a string", function() {

            beforeEach(function() {
              view.set("cellType", "foo");
              tabris._nativeBridge.flush();
              view._trigger("requestinfo", {index: 0});
              describeCalls = client.calls({op: "call", method: "describeItem"});
            });

            it("CALLs `describeItem` with type set to zero", function() {
              expect(describeCalls[0].parameters.type).to.equal(0);
            });

          });

          describe("when itemHeight is set to a function", function() {

            beforeEach(function() {
              view.set("itemHeight", itemHeightFn);
              tabris._nativeBridge.flush();
              view._trigger("requestinfo", {index: 0});
              view._trigger("requestinfo", {index: 1});
              view._trigger("requestinfo", {index: 2});
              describeCalls = client.calls({op: "call", method: "describeItem"});
            });

            it("executes `itemHeight` function", function() {
              expect(itemHeightFn).to.have.been.calledWith("a", null);
              expect(itemHeightFn).to.have.been.calledWith("b", null);
              expect(itemHeightFn).to.have.been.calledWith("c", null);
            });

            it("CALLs `describeItem` with index, default type, and height", function() {
              expect(describeCalls[0].parameters).to.eql({index: 0, type: 0, height: 50});
              expect(describeCalls[1].parameters).to.eql({index: 1, type: 0, height: 80});
              expect(describeCalls[2].parameters).to.eql({index: 2, type: 0, height: 50});
            });

          });

          describe("when both cellType and itemHeight is set to a function", function() {

            beforeEach(function() {
              view.set("cellType", cellTypeFn);
              view.set("itemHeight", itemHeightFn);
              tabris._nativeBridge.flush();
              view._trigger("requestinfo", {index: 0});
              view._trigger("requestinfo", {index: 1});
              view._trigger("requestinfo", {index: 2});
              describeCalls = client.calls({op: "call", method: "describeItem"});
            });

            it("executes `itemHeight` function", function() {
              expect(itemHeightFn).to.have.been.calledWith("a", "foo");
              expect(itemHeightFn).to.have.been.calledWith("b", "bar");
              expect(itemHeightFn).to.have.been.calledWith("c", "foo");
            });

            it("CALLs `describeItem` with index, type, and height", function() {
              expect(describeCalls[0].parameters).to.eql({index: 0, type: 0, height: 50});
              expect(describeCalls[1].parameters).to.eql({index: 1, type: 1, height: 80});
              expect(describeCalls[2].parameters).to.eql({index: 2, type: 0, height: 50});
            });

          });

          describe("when itemHeight is set to a number", function() {

            beforeEach(function() {
              view.set("itemHeight", 23);
              tabris._nativeBridge.flush();
              view._trigger("requestinfo", {index: 0});
              describeCalls = client.calls({op: "call", method: "describeItem"});
            });

            it("doesn't CALL `describeItem`", function() {
              expect(describeCalls[0].parameters.height).to.equal(23);
            });

          });

        });

        describe("when items is set again", function() {

          beforeEach(function() {
            client.resetCalls();
            view.set("items", ["e", "f"]);
          });

          it("calls native reload with item count", function() {
            let calls = client.calls({op: "call", id: view.cid, method: "reload"});
            expect(calls[0].parameters).to.eql({items: 2});
          });

        });

        describe("when items is set to null", function() {

          beforeEach(function() {
            client.resetCalls();
            view.set("items", null);
          });

          it("calls native reload with 0", function() {
            let calls = client.calls({op: "call", id: view.cid, method: "reload"});
            expect(calls[0].parameters).to.eql({items: 0});
          });

          it("sets items to empty array", function() {
            expect(view.get("items")).to.eql([]);
          });

        });

        describe("when select event is received", function() {

          let listener;

          beforeEach(function() {
            listener = spy();
          });

          it("triggers select on the collection view", function() {
            spy(console, "warn");
            view.on("select", listener);

            view._trigger("select", {index: 0});

            expect(listener).to.have.been.calledOnce;
            expect(listener).to.have.been.calledWith(view, "a", {index: 0});
            expect(console.warn).to.have.not.been.called;
          });

        });

        describe("when 'scroll' event is received", function() {

          let listener;

          beforeEach(function() {
            listener = spy();
          });

          it("triggers 'scroll' on collection view", function() {
            view.on("scroll", listener);

            view._trigger("scroll", {deltaX: 23, deltaY: 42});

            expect(listener).to.have.been.calledOnce;
            expect(listener).to.have.been.calledWith(view, {deltaX: 23, deltaY: 42});
          });

        });

        describe("when createitem event is received", function() {

          let cellCreateCall, cell;

          beforeEach(function() {
            view._trigger("createitem", {type: 0});
            cellCreateCall = client.calls({op: "create", type: "tabris.Composite"})[0];
            cell = tabris._proxies.find(cellCreateCall.id);
          });

          it("creates a Cell", function() {
            expect(cellCreateCall).to.be.ok;
            expect(cell).to.be.an.instanceof(Cell);
          });

          it("calls native addItem with created cell", function() {
            let addItemCall = client.calls({op: "call", id: view.cid, method: "addItem"})[0];
            expect(addItemCall.parameters).to.eql({widget: cell.cid});
          });

          it("calls initializeCell with the cell as parent", function() {
            expect(initializeCell.args[0][0]).to.equal(cell);
          });

          it("returns cells as children", function() {
            expect(view.children().length).to.equal(1);
            expect(view.children()[0]).to.equal(cell);
          });

          it("cell has CollectionView as parent", function() {
            expect(cell.parent()).to.equal(view);
          });

          it("returns cells as children", function() {
            expect(view.children().length).to.equal(1);
            expect(view.children()[0]).to.equal(cell);
          });

          it("cell has CollectionView as parent", function() {
            expect(cell.parent()).to.equal(view);
          });

          describe("when calling cell.dispose()", function() {

            beforeEach(function() {
              spy(console, "warn");
              cell.dispose();
            });

            it("cell is not disposed", function() {
              expect(cell.isDisposed()).to.equal(false);
            });

            it("a warning is logged", function() {
              let warning = "CollectionView cells are container-managed, they cannot be disposed of";
              expect(console.warn).to.have.been.calledWith(warning);
            });

          });

          describe("when view is disposed", function() {

            beforeEach(function() {
              view.dispose();
            });

            it("cells are disposed", function() {
              expect(cell.isDisposed()).to.equal(true);
            });

          });

          describe("when populateitem event is received", function() {

            let listener;

            beforeEach(function() {
              listener = spy();
            });

            it("triggers change:item event on the cell", function() {
              spy(console, "warn");
              cell.on("change:item", listener);

              view._trigger("populateitem", {widget: cell.cid, index: 0});

              expect(listener).to.have.been.calledWith(cell, "a", {});
              expect(cell.get("item")).to.equal("a");
              expect(console.warn).to.have.not.been.called;
            });

            it("triggers change:item event on the cell even if item is already set", function() {
              spy(console, "warn");
              view._trigger("populateitem", {widget: cell.cid, index: 0});
              cell.on("change:item", listener);

              view._trigger("populateitem", {widget: cell.cid, index: 0});

              expect(listener).to.have.been.calledWith(cell, "a", {});
              expect(cell.get("item")).to.equal("a");
              expect(console.warn).to.have.not.been.called;
            });

            it("triggers change:itemIndex event on the cell", function() {
              spy(console, "warn");
              cell.on("change:itemIndex", listener);

              view._trigger("populateitem", {widget: cell.cid, index: 0});

              expect(listener).to.have.been.calledWith(cell, 0, {});
              expect(cell.get("itemIndex")).to.equal(0);
              expect(console.warn).to.have.not.been.called;
            });

            it("cell item is accessible through field", function() {
              view._trigger("populateitem", {widget: cell.cid, index: 0});

              expect(cell.item).to.equal("a");
            });

            it("cell itemIndex is accessible through field", function() {
              view._trigger("populateitem", {widget: cell.cid, index: 0});

              expect(cell.itemIndex).to.equal(0);
            });

          });

        });

      });

    });

  });

  describe("when created with items", function() {

    let view;

    function createCell(item) {
      view._trigger("createitem", {type: 0});
      let createCalls = client.calls({op: "create", type: "tabris.Composite"});
      let cell = tabris._proxies.find(createCalls[createCalls.length - 1].id);
      view._trigger("populateitem", {widget: cell.cid, index: view.get("items").indexOf(item)});
      return cell;
    }

    beforeEach(function() {
      view = new CollectionView({
        items: ["A", "B", "C"],
        initializeCell: function() {}
      }).appendTo(parent);
    });

    it("calls reload after create and listen calls", function() {
      let allCalls = client.calls({id: view.cid});
      let listen1Call = client.calls({op: "listen", event: "createitem", id: view.cid})[0];
      let listen2Call = client.calls({op: "listen", event: "populateitem", id: view.cid})[0];
      let reloadCall = client.calls({op: "call", method: "reload", id: view.cid})[0];

      expect(allCalls.indexOf(reloadCall)).to.be.above(allCalls.indexOf(listen1Call));
      expect(allCalls.indexOf(reloadCall)).to.be.above(allCalls.indexOf(listen2Call));
    });

    describe("insert", function() {
      beforeEach(function() {
        client.resetCalls();
      });

      it("can prepend to items array", function() {
        view.insert(["d", "e"], 0);

        expect(view.get("items")).to.eql(["d", "e", "A", "B", "C"]);
      });

      it("can append to items array", function() {
        view.insert(["d", "e"], 3);

        expect(view.get("items")).to.eql(["A", "B", "C", "d", "e"]);
      });

      it("calls native update", function() {
        view.insert(["d", "e"], 1);

        let updateCall = client.calls({op: "call", method: "update", id: view.cid})[0];
        expect(updateCall.parameters).to.eql({insert: [1, 2]});
      });

      it("handles single parameter", function() {
        view.insert(["d", "e"]);

        let updateCall = client.calls({op: "call", method: "update", id: view.cid})[0];
        expect(updateCall.parameters).to.eql({insert: [3, 2]});
        expect(view.get("items")).to.eql(["A", "B", "C", "d", "e"]);
      });

      it("handles negative index", function() {
        view.insert(["d", "e"], -1);

        let updateCall = client.calls({op: "call", method: "update", id: view.cid})[0];
        expect(updateCall.parameters).to.eql({insert: [2, 2]});
        expect(view.get("items")).to.eql(["A", "B", "d", "e", "C"]);
      });

      it("adjusts index to bounds", function() {
        view.insert(["x"], 5);

        let call = client.calls({op: "call", method: "update", id: view.cid})[0];
        expect(call.parameters).to.eql({insert: [3, 1]});
        expect(view.get("items")).to.eql(["A", "B", "C", "x"]);
      });

      it("adjusts negative index to bounds", function() {
        view.insert(["x"], -5);

        let call = client.calls({op: "call", method: "update", id: view.cid})[0];
        expect(call.parameters).to.eql({insert: [0, 1]});
        expect(view.get("items")).to.eql(["x", "A", "B", "C"]);
      });

      it("fails when index is not a number", function() {
        expect(() => {
          view.insert(["d"], NaN);
        }).to.throw();
      });

      it("fails when items is not an array", function() {
        expect(() => {
          view.insert({});
        }).to.throw();
      });

      it("adjusts cells itemIndex properties", function() {
        view.set("items", ["A", "B", "C", "D", "E"]);
        let a = createCell("A");
        let b = createCell("B");
        let c = createCell("C");
        let d = createCell("D");
        let e = createCell("E");

        view.insert(["X", "Y"], 2);

        expect(a.get("itemIndex")).to.equal(0);
        expect(b.get("itemIndex")).to.equal(1);
        expect(c.get("itemIndex")).to.equal(4);
        expect(d.get("itemIndex")).to.equal(5);
        expect(e.get("itemIndex")).to.equal(6);
      });

    });

    describe("remove", function() {

      beforeEach(function() {
        client.resetCalls();
      });

      it("can remove beginning of items array", function() {
        view.remove(0, 2);

        expect(view.get("items")).to.eql(["C"]);
      });

      it("can remove end of items array", function() {
        view.remove(1, 2);

        expect(view.get("items")).to.eql(["A"]);
      });

      it("calls native update", function() {
        view.remove(1, 2);

        let updateCall = client.calls({op: "call", method: "update", id: view.cid})[0];
        expect(updateCall.parameters).to.eql({remove: [1, 2]});
      });

      it("handles single parameter", function() {
        view.remove(1);

        let updateCall = client.calls({op: "call", method: "update", id: view.cid})[0];
        expect(updateCall.parameters).to.eql({remove: [1, 1]});
        expect(view.get("items")).to.eql(["A", "C"]);
      });

      it("handles negative index", function() {
        view.remove(-1, 1);

        let updateCall = client.calls({op: "call", method: "update", id: view.cid})[0];
        expect(updateCall.parameters).to.eql({remove: [2, 1]});
        expect(view.get("items")).to.eql(["A", "B"]);
      });

      it("ignores index out of bounds", function() {
        view.remove(5, 2);

        let updateCalls = client.calls({op: "call", method: "update", id: view.cid});
        expect(updateCalls).to.eql([]);
        expect(view.get("items")).to.eql(["A", "B", "C"]);
      });

      it("ignores negative index out of bounds", function() {
        view.remove(-5, 2);

        let updateCalls = client.calls({op: "call", method: "update", id: view.cid});
        expect(updateCalls).to.eql([]);
        expect(view.get("items")).to.eql(["A", "B", "C"]);
      });

      it("repairs count if exceeding", function() {
        view.remove(2, 5);

        let updateCall = client.calls({op: "call", method: "update", id: view.cid})[0];
        expect(updateCall.parameters).to.eql({remove: [2, 1]});
        expect(view.get("items")).to.eql(["A", "B"]);
      });

      it("ignores zero count", function() {
        view.remove(2, 0);

        let updateCalls = client.calls({op: "call", method: "update", id: view.cid});
        expect(updateCalls).to.eql([]);
        expect(view.get("items")).to.eql(["A", "B", "C"]);
      });

      it("fails when index is not a number", function() {
        expect(() => {
          view.remove(NaN);
        }).to.throw();
      });

      it("fails when count is not a number", function() {
        expect(() => {
          view.remove(0, NaN);
        }).to.throw();
      });

      it("adjusts cells itemIndex properties", function() {
        view.set("items", ["A", "B", "C", "D", "E"]);
        let a = createCell("A");
        let b = createCell("B");
        let c = createCell("C");
        let d = createCell("D");
        let e = createCell("E");

        view.remove(1, 2);

        expect(a.get("itemIndex")).to.equal(0);
        expect(b.get("itemIndex")).to.equal(1);
        expect(c.get("itemIndex")).to.equal(2);
        expect(d.get("itemIndex")).to.equal(1);
        expect(e.get("itemIndex")).to.equal(2);
      });

    });

    describe("refresh", function() {

      beforeEach(function() {
        client.resetCalls();
      });

      it("without parameters calls native update", function() {
        view.refresh();

        let updateCall = client.calls({op: "call", method: "update", id: view.cid})[0];
        expect(updateCall.parameters.reload).to.eql([0, 3]);
      });

      it("calls native update", function() {
        view.refresh(1);

        let updateCall = client.calls({op: "call", method: "update", id: view.cid})[0];
        expect(updateCall.parameters.reload).to.eql([1, 1]);
      });

      it("accepts negative index", function() {
        view.refresh(-1);

        let updateCall = client.calls({op: "call", method: "update", id: view.cid})[0];
        expect(updateCall.parameters.reload).to.eql([2, 1]);
      });

      it("ignores out-of-bounds index", function() {
        view.refresh(5);

        let calls = client.calls({op: "call", method: "update", id: view.cid});
        expect(calls).to.eql([]);
      });

      it("fails with invalid parameter", function() {
        expect(() => {
          view.refresh(NaN);
        }).to.throw();
      });

    });

    describe("reveal", function() {

      beforeEach(function() {
        client.resetCalls();
      });

      it("calls native reveal with index", function() {
        view.reveal(1);

        let call = client.calls({op: "call", method: "reveal", id: view.cid})[0];
        expect(call.parameters).to.eql({index: 1});
      });

      it("accepts negative index", function() {
        view.reveal(-1);

        let call = client.calls({op: "call", method: "reveal", id: view.cid})[0];
        expect(call.parameters).to.eql({index: 2});
      });

      it("ignores out-of-bounds index", function() {
        view.reveal(5);

        let calls = client.calls({op: "call", method: "reveal", id: view.cid});
        expect(calls).to.eql([]);
      });

      it("fails with invalid parameter", function() {
        expect(() => {
          view.refresh(NaN);
        }).to.throw();
      });

    });

  });

});
