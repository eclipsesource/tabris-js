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
      expect(tab.get("image")).toEqual({src: "bar", width: null, height: null, scale: null});
      expect(tab.get("badge")).toBe("1");
    });

    describe("and appended to an illegal parent", function() {

      it("crashes", function() {
        expect(function() {
          tab.appendTo(tabris.create("Composite"));
        }).toThrow(new Error("Tab must be a child of TabFolder"));
      });

    });

    describe("and appended to a TabFolder", function() {

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

      describe("and another tab is created", function() {

        beforeEach(function() {
          nativeBridge.resetCalls();
          tabris.create("Tab", {}).appendTo(tabFolder);
        });

        it("creates TabItem with incremented index", function() {
          var itemCreate = nativeBridge.calls({op: "create", type: "rwt.widgets.TabItem"})[0];
          expect(itemCreate.properties.index).toBe(1);
        });

      });

      describe("and the Tab is disposed", function() {

        beforeEach(function() {
          nativeBridge.resetCalls();
          tab.dispose();
        });

        it("then destroys the control", function() {
          expect(nativeBridge.calls({op: "destroy", id: tab.id})[0]).toBeDefined();
        });

        it("then destroys the item", function() {
          expect(nativeBridge.calls({op: "destroy", id: itemCreate.id})[0]).toBeDefined();
        });

        describe("and another Tab is created", function() {

          beforeEach(function() {
            nativeBridge.resetCalls();
            tabris.create("Tab", {}).appendTo(tabFolder);
          });

          it("then it creates a TabItem with the same index", function() {
            var tabItemCreate = nativeBridge.calls({op: "create", type: "rwt.widgets.TabItem"})[0];
            expect(tabItemCreate.properties.index).toBe(0);
          });

        });

      });

    });

  });

  describe("selection property:", function() {

    var tab1, tab2;

    beforeEach(function() {
      tab1 = tabris.create("Tab", {}).appendTo(tabFolder);
      tab2 = tabris.create("Tab", {}).appendTo(tabFolder);
    });

    it("Setting a Tab SETs tabItem id", function() {
      tabFolder.set("selection", tab2);

      var setCall = nativeBridge.calls({op: "set", id: tabFolder.id})[0];
      expect(setCall.properties.selection).toBe(tab2._tabItem.id);
    });

    it("Get returns Tab", function() {
      spyOn(nativeBridge, "get").and.returnValue(tab2._tabItem.id);

      expect(tabFolder.get("selection")).toBe(tab2);
    });

    it("Get returns null", function() {
      expect(tabFolder.get("selection")).toBeNull();
    });

  });

  describe("tabBarLocation property", function() {

    beforeEach(function() {
      nativeBridge.resetCalls();
    });

    it("is omitted in create", function() {
      tabFolder = tabris.create("TabFolder", {tabBarLocation: "top"});

      var properties = nativeBridge.calls({id: tabFolder.id, op: "create"})[0].properties;
      expect(properties.tabBarLocation).toBeUndefined();
    });

    it("sets style TOP for value 'top'", function() {
      tabFolder = tabris.create("TabFolder", {tabBarLocation: "top"});

      var properties = nativeBridge.calls({id: tabFolder.id, op: "create"})[0].properties;
      expect(properties.style).toEqual(["TOP"]);
    });

    it("sets style BOTTOM for value 'bottom'", function() {
      tabFolder = tabris.create("TabFolder", {tabBarLocation: "bottom"});

      var properties = nativeBridge.calls({id: tabFolder.id, op: "create"})[0].properties;
      expect(properties.style).toEqual(["BOTTOM"]);
    });

    it("sets no style for value 'default'", function() {
      tabFolder = tabris.create("TabFolder", {tabBarLocation: "default"});

      var properties = nativeBridge.calls({id: tabFolder.id, op: "create"})[0].properties;
      expect(properties.style).toBeUndefined();
    });

  });

});
