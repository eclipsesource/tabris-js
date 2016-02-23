describe("Drawer", function() {

  var nativeBridge;
  var drawer, _drawer;

  beforeEach(function() {
    nativeBridge = new NativeBridgeSpy();
    tabris._reset();
    tabris._init(nativeBridge);
    tabris.ui = tabris.create("_UI");
    nativeBridge.resetCalls();
    drawer = tabris.create("Drawer", {background: "#ff0000"});
    _drawer = tabris(nativeBridge.calls({op: "create", type: "tabris.Drawer"})[0].id);
  });

  afterEach(function() {
    delete tabris.ui;
  });

  describe("create", function() {

    it("creates a Composite and a Drawer", function() {
      expect(nativeBridge.calls({op: "create", type: "rwt.widgets.Composite"}).length).toBe(1);
      expect(nativeBridge.calls({op: "create", type: "tabris.Drawer"}).length).toBe(1);
    });

    it("sets drawer on ui as read-only", function() {
      tabris.ui.drawer = null;
      expect(tabris.ui.drawer).toBe(drawer);
    });

    it("sets ui as parent", function() {
      expect(drawer.parent()).toBe(tabris.ui);
      expect(tabris.ui.children("Drawer")[0]).toBe(drawer);
    });

    it("fails when a drawer already exists", function() {
      expect(function() {tabris.create("Drawer");}).toThrow();
      expect(nativeBridge.calls({op: "create", type: "tabris.Drawer"}).length).toBe(1);
    });

    describe("created Composite", function() {

      var properties;

      beforeEach(function() {
        var createCall = nativeBridge.calls({op: "create", type: "rwt.widgets.Composite"})[0];
        properties = createCall.properties;
      });

      it("parent is _drawer", function() {
        expect(properties.parent).toEqual(_drawer.cid);
      });

      it("is full-size", function() {
        expect(properties.layoutData).toEqual({left: 0, right: 0, top: 0, bottom: 0});
      });

      it("has non-drawer properties", function() {
        expect(properties.background).toEqual([255, 0, 0, 255]);
      });

    });

    describe("created Drawer", function() {

      var properties;

      beforeEach(function() {
        var createCall = nativeBridge.calls({op: "create", type: "tabris.Drawer"})[0];
        properties = createCall.properties;
      });

      it("does not have non-drawer properties set", function() {
        expect(properties.background).not.toBeDefined();
      });

      it("does not have a parent", function() {
        expect(properties.parent).not.toBeDefined();
      });

    });

  });

  describe("instance: ", function() {

    beforeEach(function() {
      nativeBridge.resetCalls();
    });

    describe("when a child is appended", function() {
      var child;

      beforeEach(function() {
        child = tabris.create("TextView");
        nativeBridge.resetCalls();
        drawer.append(child);
      });

      it("child's parent is set to the composite", function() {
        var call = nativeBridge.calls({op: "set", id: child.cid})[0];
        expect(call.properties.parent).toEqual(drawer.cid);
      });

    });

    describe("open", function() {

      it("CALLs open", function() {
        drawer.open();
        expect(nativeBridge.calls({op: "call", id: _drawer.cid})[0].method).toBe("open");
      });

    });

    describe("close", function() {

      it("CALLs close", function() {
        drawer.close();
        expect(nativeBridge.calls({op: "call", id: _drawer.cid})[0].method).toBe("close");
      });

    });

    describe("dispose", function() {

      beforeEach(function() {
        drawer.dispose();
      });

      it("disposes drawer and composite", function() {
        expect(nativeBridge.calls({op: "destroy", id: drawer.cid}).length).toBe(1);
        expect(nativeBridge.calls({op: "destroy", id: _drawer.cid}).length).toBe(1);
      });

      it("clear tabris.ui.drawer", function() {
        expect(tabris.ui.drawer).toBeNull();
      });

      it("allows new drawer to be created", function() {
        expect(function() {tabris.create("Drawer");}).not.toThrow();
        expect(nativeBridge.calls({op: "create", type: "tabris.Drawer"}).length).toBe(1);
      });

    });

  });

});
