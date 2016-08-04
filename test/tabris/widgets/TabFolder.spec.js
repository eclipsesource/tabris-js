describe("TabFolder", function() {

  var nativeBridge, tabFolder, parent;

  beforeEach(function() {
    nativeBridge = new NativeBridgeSpy();
    tabris._reset();
    tabris._init(nativeBridge);
    parent = new tabris.Composite();
    nativeBridge.resetCalls();
    tabFolder = new tabris.TabFolder().appendTo(parent);
  });

  it("children list is empty", function() {
    expect(tabFolder.children().toArray()).toEqual([]);
  });

  it("paging is false", function() {
    expect(tabFolder.get("paging")).toBe(false);
  });

  it("returns initial property values", function() {
    expect(tabFolder.get("paging")).toBe(false);
  });

  describe("when paging is set", function() {

    beforeEach(function() {
      tabFolder.set("paging", true);
    });

    it("sets the 'data' property", function() {
      var setOp = nativeBridge.calls({id: tabFolder.cid, op: "create"})[0];
      expect(setOp.properties.data).toEqual({paging: true});
    });

    it("getter reflects change", function() {
      expect(tabFolder.get("paging")).toBe(true);
    });

  });

  describe("When a Tab is created", function() {

    var tab, controlCreate;

    beforeEach(function() {
      tab = new tabris.Tab({
        title: "foo",
        image: {src: "bar"},
        selectedImage: {src: "selectedBar"},
        badge: "1",
        background: "#010203",
        visible: false
      });
      controlCreate = nativeBridge.calls({op: "create"})[1];
    });

    it("creates a Composite", function() {
      expect(controlCreate.type).toBe("tabris.Composite");
      expect(controlCreate.id).toBe(tab.cid);
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
      expect(tab.get("selectedImage")).toEqual({src: "selectedBar"});
      expect(tab.get("badge")).toBe("1");
      expect(tab.get("visible")).toBe(false);
    });

    it("getter returns initial item properties", function() {
      tab = new tabris.Tab();
      expect(tab.get("title")).toBe("");
      expect(tab.get("image")).toBe(null);
      expect(tab.get("selectedImage")).toBe(null);
      expect(tab.get("badge")).toBe("");
      expect(tab.get("visible")).toBe(true);
    });

    describe("and appended to an illegal parent", function() {

      it("crashes", function() {
        expect(() => {
          tab.appendTo(new tabris.Composite());
        }).toThrowError("Tab must be a child of TabFolder");
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
        expect(call.properties.parent).toBe(tabFolder.cid);
      });

      it("creates a TabItem with the TabFolder as parent", function() {
        expect(itemCreate).toBeDefined();
        expect(itemCreate.properties.parent).toBe(tabFolder.cid);
      });

      it("sets the composite as the TabItem's control", function() {
        expect(itemCreate.properties.control).toBe(controlCreate.id);
      });

      it("sets the item properties to the TabItem", function() {
        expect(itemCreate.properties.text).toBe("foo");
        expect(itemCreate.properties.image).toEqual(["bar", null, null, null]);
        expect(itemCreate.properties.selectedImage).toEqual(["selectedBar", null, null, null]);
        expect(itemCreate.properties.badge).toBe("1");
        expect(itemCreate.properties.visibility).toBe(false);
      });

      it("sets the TabItem index", function() {
        expect(itemCreate.properties.index).toBe(0);
      });

      it("getter gets item properties from cache", function() {
        tab.set({title: "foo", "badge": "bar", image: "foobar.jpg", selectedImage: "selectedFoobar.jpg"});

        expect(tab.get("title")).toBe("foo");
        expect(tab.get("badge")).toBe("bar");
        expect(tab.get("image")).toEqual({src: "foobar.jpg"});
        expect(tab.get("selectedImage")).toEqual({src: "selectedFoobar.jpg"});
      });

      it("children list contains only the tab", function() {
        expect(tabFolder.children().toArray()).toEqual([tab]);
      });

      it("find list contains only the tab", function() {
        expect(tabFolder.find().toArray()).toEqual([tab]);
      });

      it("parent find list contains only the TabFolder and tab", function() {
        expect(tabFolder.parent().find().toArray()).toEqual([tabFolder, tab]);
      });

      it("parent childrens children list contains only the tab", function() {
        expect(tabFolder.parent().children().children().toArray()).toEqual([tab]);
      });

      it("children can be filtered with id selector", function() {
        var tab2 = new tabris.Tab({id: "foo"}).appendTo(tabFolder);
        expect(tabFolder.children("#foo").toArray()).toEqual([tab2]);
      });

      it("find list can be filtered with id selector", function() {
        var tab2 = new tabris.Tab({id: "foo"}).appendTo(tabFolder);
        expect(tabFolder.parent().find("#foo").toArray()).toEqual([tab2]);
      });

      describe("and another tab is created", function() {

        beforeEach(function() {
          nativeBridge.resetCalls();
          new tabris.Tab().appendTo(tabFolder);
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
          expect(nativeBridge.calls({op: "destroy", id: tab.cid})[0]).toBeDefined();
        });

        it("then destroys the item", function() {
          expect(nativeBridge.calls({op: "destroy", id: itemCreate.id})[0]).toBeDefined();
        });

        describe("and another Tab is created", function() {

          beforeEach(function() {
            nativeBridge.resetCalls();
            new tabris.Tab().appendTo(tabFolder);
          });

          it("then it creates a TabItem with the same index", function() {
            var tabItemCreate = nativeBridge.calls({op: "create", type: "rwt.widgets.TabItem"})[0];
            expect(tabItemCreate.properties.index).toBe(0);
          });

        });

      });

      describe("and the TabFolder is disposed", function() {

        beforeEach(function() {
          tabFolder.dispose();
        });

        it("it disposes the Tab", function() {
          expect(tab.isDisposed()).toBe(true);
        });

      });

    });

  });

  describe("selection property:", function() {

    var tab;

    beforeEach(function() {
      tab = new tabris.Tab().appendTo(tabFolder);
    });

    it("Setting a Tab SETs tabItem id", function() {
      tabFolder.set("selection", tab);

      var setCall = nativeBridge.calls({op: "set", id: tabFolder.cid})[0];
      expect(setCall.properties.selection).toBe(tab._tabItem.cid);
    });

    it("Ignores setting null with warning", function() {
      spyOn(console, "warn");

      tabFolder.set("selection", null);

      var calls = nativeBridge.calls({op: "set", id: tabFolder.cid});
      expect(calls.length).toBe(0);
      expect(console.warn).toHaveBeenCalledWith("Can not set TabFolder selection to null");
    });

    it("Ignores setting disposed tab with warning", function() {
      spyOn(console, "warn");
      tab.dispose();

      tabFolder.set("selection", tab);

      var calls = nativeBridge.calls({op: "set", id: tabFolder.cid});
      expect(calls.length).toBe(0);
      expect(console.warn).toHaveBeenCalledWith("Can not set TabFolder selection to disposed Tab");
    });

    it("Ignores setting non tab", function() {
      spyOn(console, "warn");

      tabFolder.set("selection", "foo");

      var calls = nativeBridge.calls({op: "set", id: tabFolder.cid});
      expect(calls.length).toBe(0);
      expect(console.warn).toHaveBeenCalledWith("Can not set TabFolder selection to foo");
    });

    it("Get returns Tab", function() {
      spyOn(nativeBridge, "get").and.returnValue(tab._tabItem.cid);

      expect(tabFolder.get("selection")).toBe(tab);
    });

    it("Get returns null", function() {
      expect(tabFolder.get("selection")).toBeNull();
    });

    it("supports native event change:selection", function() {
      var listener = jasmine.createSpy();
      tabFolder.on("change:selection", listener);

      tabris._notify(tabFolder.cid, "Selection", {selection: tab._tabItem.cid});

      expect(listener.calls.count()).toBe(1);
      expect(listener.calls.argsFor(0)[0]).toBe(tabFolder);
      expect(listener.calls.argsFor(0)[1]).toBe(tab);
      expect(listener.calls.argsFor(0)[2]).toEqual({});
    });

    it("supports native event select", function() {
      var listener = jasmine.createSpy();
      tabFolder.on("select", listener);

      tabris._notify(tabFolder.cid, "Selection", {selection: tab._tabItem.cid});

      expect(listener.calls.count()).toBe(1);
      expect(listener.calls.argsFor(0)[0]).toBe(tabFolder);
      expect(listener.calls.argsFor(0)[1]).toBe(tab);
      expect(listener.calls.argsFor(0)[2]).toEqual({});
    });

  });

  describe("tabBarLocation property", function() {

    beforeEach(function() {
      nativeBridge.resetCalls();
    });

    it("passes property to client", function() {
      tabFolder = new tabris.TabFolder({tabBarLocation: "top"});

      var properties = nativeBridge.calls({id: tabFolder.cid, op: "create"})[0].properties;
      expect(properties.tabBarLocation).toBe("top");
    });

    it("property is cached", function() {
      spyOn(nativeBridge, "get");
      tabFolder = new tabris.TabFolder({tabBarLocation: "top"});

      var result = tabFolder.get("tabBarLocation");

      expect(nativeBridge.get).not.toHaveBeenCalled();
      expect(result).toBe("top");
    });

    it("sets style TOP for value 'top'", function() {
      tabFolder = new tabris.TabFolder({tabBarLocation: "top"});

      var properties = nativeBridge.calls({id: tabFolder.cid, op: "create"})[0].properties;
      expect(properties.style).toEqual(["TOP"]);
    });

    it("sets style BOTTOM for value 'bottom'", function() {
      tabFolder = new tabris.TabFolder({tabBarLocation: "bottom"});

      var properties = nativeBridge.calls({id: tabFolder.cid, op: "create"})[0].properties;
      expect(properties.style).toEqual(["BOTTOM"]);
    });

    it("sets no style for value 'hidden'", function() {
      tabFolder = new tabris.TabFolder({tabBarLocation: "hidden"});

      var properties = nativeBridge.calls({id: tabFolder.cid, op: "create"})[0].properties;
      expect(properties.style).toBeUndefined();
    });

    it("sets no style for value 'auto'", function() {
      tabFolder = new tabris.TabFolder({tabBarLocation: "auto"});

      var properties = nativeBridge.calls({id: tabFolder.cid, op: "create"})[0].properties;
      expect(properties.style).toBeUndefined();
    });

  });

});

describe("Tab", function() {

  var nativeBridge, tabFolder;

  beforeEach(function() {
    nativeBridge = new NativeBridgeSpy();
    tabris._reset();
    tabris._init(nativeBridge);
    tabFolder = new tabris.TabFolder();
    nativeBridge.resetCalls();
  });

  describe("property 'visible'", function() {

    it("is not rendered by default", function() {
      var tab = new tabris.Tab().appendTo(tabFolder);

      var properties = nativeBridge.calls({id: tab.cid, op: "create"})[0].properties;

      expect(properties.visibile).not.toBeDefined();
      expect(properties.visibility).not.toBeDefined();
    });

    it("is not rendered on Composite", function() {
      var tab = new tabris.Tab({visible: false}).appendTo(tabFolder);

      var properties = nativeBridge.calls({id: tab.cid, op: "create"})[0].properties;

      expect(properties.visibility).not.toBeDefined();
    });

    it("is rendered as 'visibility' on TabItem", function() {
      var tab = new tabris.Tab({visible: false}).appendTo(tabFolder);

      var properties = nativeBridge.calls({id: tab._tabItem.cid, op: "create"})[0].properties;

      expect(properties.visibility).toBe(false);
    });

  });

});
