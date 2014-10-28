/**
 * Copyright (c) 2014 EclipseSource.
 * All rights reserved.
 */

describe("TabFolder", function() {

  var nativeBridge, tabFolder, parent;

  beforeEach(function() {
    nativeBridge = new NativeBridgeSpy();
    tabris._reset();
    tabris._start(nativeBridge);
    parent = new tabris.Proxy("parent-id");
    tabFolder = tabris.create("TabFolder").appendTo(parent);
  });

  it("children list is empty", function() {
    expect(tabFolder.children()).toEqual([]);
  });

  it("paging is false", function() {
    expect(tabFolder.get("paging")).toBe(false);
  });

  describe("when paging is set", function() {

    beforeEach(function() {
      tabFolder.set("paging", true);
    });

    it("sets the 'data' property", function() {
      var setOp = nativeBridge.calls({id: tabFolder.id, op: "create"})[0];
      expect(setOp.properties.data).toEqual({paging: true});
    });

    it("getter reflects change", function() {
      expect(tabFolder.get("paging")).toBe(true);
    });

  });

  describe("When a Tab is created", function() {

    var tab, controlCreate;

    beforeEach(function() {
      tab = tabris.create("Tab", {
        title: "foo",
        image: {src: "bar"},
        badge: "1",
        background: "#010203"
      });
      controlCreate = nativeBridge.calls({op: "create"})[1];
    });

    it("creates a Composite", function() {
      expect(controlCreate.type).toBe("rwt.widgets.Composite");
      expect(controlCreate.id).toBe(tab.id);
    });

    it("sets non-item properties on the Composite", function() {
      expect(controlCreate.properties.background).toEqual([1, 2, 3, 255]);
    });

    it("does not create a TabItem", function() {
      expect(nativeBridge.calls({op: "create", type: "rwt.widgets.TabItem"}).length).toBe(0);
    });

    it("getter returns item properties", function() {
      expect(tab.get("title")).toBe("foo");
      expect(tab.get("image")).toEqual({src: "bar"});
      expect(tab.get("badge")).toBe("1");
    });

    describe("when appending to an illegal parent", function() {

      var consoleBackup = window.console;

      beforeEach(function() {
        window.console = jasmine.createSpyObj("console", ["log", "info", "warn", "error"]);
      });

      afterEach(function() {
        window.console = consoleBackup;
      });

      it("logs a warning", function() {
        tab.appendTo(tabris.create("Composite"));
        expect(window.console.warn).toHaveBeenCalledWith("Unsupported parent value: Tab must be a child of TabFolder");
      });

      // TODO throw an error instead of logging a warning, will be fixed in next commit
      // it("crashes", function() {
      //   expect(function() {
      //     tab.appendTo(tabris.create("Composite"));
      //   }).toThrow(new Error("Tab must be a child of TabFolder"));
      // });

    });

    describe("when appending to a TabFolder", function() {

      var itemCreate;

      beforeEach(function() {
        nativeBridge.resetCalls();
        tab.appendTo(tabFolder);
        itemCreate = nativeBridge.calls({op: "create", type: "rwt.widgets.TabItem"})[0];
      });

      it("sets the Composite's parent", function() {
        var call = nativeBridge.calls({op: "set", id: controlCreate.id})[0];
        expect(call.properties.parent).toBe(tabFolder.id);
      });

      it("creates a TabItem with the TabFolder as parent", function() {
        expect(itemCreate).toBeDefined();
        expect(itemCreate.properties.parent).toBe(tabFolder.id);
      });

      it("sets the composite as the TabItem's control", function() {
        expect(itemCreate.properties.control).toBe(controlCreate.id);
      });

      it("sets the item properties to the TabItem", function() {
        expect(itemCreate.properties.text).toBe("foo");
        expect(itemCreate.properties.image).toEqual(["bar", null, null, null]);
        expect(itemCreate.properties.badge).toBe("1");
      });

      it("sets the TabItem index", function() {
        expect(itemCreate.properties.index).toBe(0);
      });

      it("getter delegates item properties to native", function() {
        tab.get("title");
        tab.get("badge");

        expect(nativeBridge.calls({op: "get", id: itemCreate.id}).length).toBe(2);
      });

      it("children list contains only the tab", function() {
        expect(tabFolder.children()).toEqual([tab]);
      });

      describe("when another tab is created", function() {

        beforeEach(function() {
          nativeBridge.resetCalls();
          tabris.create("Tab", {}).appendTo(tabFolder);
        });

        it("creates TabItem with incremented index", function() {
          var itemCreate = nativeBridge.calls({op: "create", type: "rwt.widgets.TabItem"})[0];
          expect(itemCreate.properties.index).toBe(1);
        });

      });

      describe("when the Tab is disposed", function() {

        beforeEach(function() {
          nativeBridge.resetCalls();
          tab.dispose();
        });

        it("destroys the control", function() {
          expect(nativeBridge.calls({op: "destroy", id: tab.id})[0]).toBeDefined();
        });

        it("destroys the item", function() {
          expect(nativeBridge.calls({op: "destroy", id: itemCreate.id})[0]).toBeDefined();
        });

        describe("when another Tab is created", function() {

          beforeEach(function() {
            nativeBridge.resetCalls();
            tabris.create("Tab", {}).appendTo(tabFolder);
          });

          it("creates TabItem with same index", function() {
            var tabItemCreate = nativeBridge.calls({op: "create", type: "rwt.widgets.TabItem"})[0];
            expect(tabItemCreate.properties.index).toBe(0);
          });

        });

      });

    });

  });

});
