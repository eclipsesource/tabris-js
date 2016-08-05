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

    it("sets the 'paging' property", function() {
      var setOp = nativeBridge.calls({id: tabFolder.cid, op: "create"})[0];
      expect(setOp.properties.paging).toEqual(true);
    });

    it("getter reflects change", function() {
      expect(tabFolder.get("paging")).toBe(true);
    });

  });

  describe("When a Tab is created", function() {

    var tab, create;

    beforeEach(function() {
      tab = new tabris.Tab({
        title: "foo",
        image: {src: "bar"},
        selectedImage: {src: "selectedBar"},
        badge: "1",
        background: "#010203",
        visible: false
      });
      create = nativeBridge.calls({op: "create"})[1];
    });

    it("creates a Tab", function() {
      expect(create.type).toBe("tabris.Tab");
      expect(create.id).toBe(tab.cid);
    });

    it("getter returns initial properties", function() {
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

      beforeEach(function() {
        nativeBridge.resetCalls();
        tab.appendTo(tabFolder);
      });

      it("sets the tabs's parent", function() {
        var call = nativeBridge.calls({op: "set", id: create.id})[0];
        expect(call.properties.parent).toBe(tabFolder.cid);
      });

      it("getter gets tab properties from cache", function() {
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

      describe("and the Tab is disposed", function() {

        beforeEach(function() {
          nativeBridge.resetCalls();
          tab.dispose();
        });

        it("then destroys the tab", function() {
          expect(nativeBridge.calls({op: "destroy", id: tab.cid})[0]).toBeDefined();
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

    it("Setting a Tab SETs tab id", function() {
      tabFolder.set("selection", tab);

      var setCall = nativeBridge.calls({op: "set", id: tabFolder.cid})[0];
      expect(setCall.properties.selection).toBe(tab.cid);
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
      expect(console.warn).toHaveBeenCalledWith("Can not set TabFolder selection to Tab");
    });

    it("Ignores setting non tab", function() {
      spyOn(console, "warn");

      tabFolder.set("selection", "foo");

      var calls = nativeBridge.calls({op: "set", id: tabFolder.cid});
      expect(calls.length).toBe(0);
      expect(console.warn).toHaveBeenCalledWith("Can not set TabFolder selection to foo");
    });

    it("Get returns Tab", function() {
      spyOn(nativeBridge, "get").and.returnValue(tab.cid);

      expect(tabFolder.get("selection")).toBe(tab);
    });

    it("Get returns null", function() {
      expect(tabFolder.get("selection")).toBeNull();
    });

    it("supports native event change:selection", function() {
      var listener = jasmine.createSpy();
      tabFolder.on("change:selection", listener);

      tabris._notify(tabFolder.cid, "select", {selection: tab.cid});

      expect(listener.calls.count()).toBe(1);
      expect(listener.calls.argsFor(0)[0]).toBe(tabFolder);
      expect(listener.calls.argsFor(0)[1]).toBe(tab);
      expect(listener.calls.argsFor(0)[2]).toEqual({});
    });

    it("supports native event select", function() {
      var listener = jasmine.createSpy();
      tabFolder.on("select", listener);

      tabris._notify(tabFolder.cid, "select", {selection: tab.cid});

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

    it("sets value tabBarLocation 'top'", function() {
      tabFolder = new tabris.TabFolder({tabBarLocation: "top"});

      var properties = nativeBridge.calls({id: tabFolder.cid, op: "create"})[0].properties;
      expect(properties.tabBarLocation).toEqual("top");
    });

    it("sets tabBarLocation 'bottom'", function() {
      tabFolder = new tabris.TabFolder({tabBarLocation: "bottom"});

      var properties = nativeBridge.calls({id: tabFolder.cid, op: "create"})[0].properties;
      expect(properties.tabBarLocation).toEqual("bottom");
    });

    it("sets tabBarLocation 'hidden'", function() {
      tabFolder = new tabris.TabFolder({tabBarLocation: "hidden"});

      var properties = nativeBridge.calls({id: tabFolder.cid, op: "create"})[0].properties;
      expect(properties.tabBarLocation).toEqual("hidden");
    });

    it("sets tabBarLocation 'auto'", function() {
      tabFolder = new tabris.TabFolder({tabBarLocation: "auto"});

      var properties = nativeBridge.calls({id: tabFolder.cid, op: "create"})[0].properties;
      expect(properties.tabBarLocation).toEqual("auto");
    });

  });

});
