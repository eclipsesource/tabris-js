describe("Drawer", function() {

  var nativeBridge;
  var drawer;

  beforeEach(function() {
    nativeBridge = new NativeBridgeSpy();
    tabris._reset();
    tabris._init(nativeBridge);
    tabris.ui = tabris.create("_UI");
    nativeBridge.resetCalls();
    drawer = new tabris.Drawer({background: "#ff0000"});
  });

  afterEach(function() {
    delete tabris.ui;
  });

  describe("create", function() {

    it("creates Drawer", function() {
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
      expect(() => { new tabris.Drawer(); }).toThrow();
      expect(nativeBridge.calls({op: "create", type: "tabris.Drawer"}).length).toBe(1);
    });

  });

  describe("instance: ", function() {

    beforeEach(function() {
      nativeBridge.resetCalls();
    });

    describe("when a child is appended", function() {
      var child;

      beforeEach(function() {
        child = new tabris.TextView();
        nativeBridge.resetCalls();
        drawer.append(child);
      });

      it("child's parent is set to the drawer", function() {
        var call = nativeBridge.calls({op: "set", id: child.cid})[0];
        expect(call.properties.parent).toEqual(drawer.cid);
      });

    });

    describe("open", function() {

      it("CALLs open", function() {
        drawer.open();
        expect(nativeBridge.calls({op: "call", id: drawer.cid})[0].method).toBe("open");
      });

    });

    describe("close", function() {

      it("CALLs close", function() {
        drawer.close();
        expect(nativeBridge.calls({op: "call", id: drawer.cid})[0].method).toBe("close");
      });

    });

    describe("dispose", function() {

      beforeEach(function() {
        drawer.dispose();
      });

      it("disposes drawer and composite", function() {
        expect(nativeBridge.calls({op: "destroy", id: drawer.cid}).length).toBe(1);
        expect(nativeBridge.calls({op: "destroy", id: drawer.cid}).length).toBe(1);
      });

      it("clear tabris.ui.drawer", function() {
        expect(tabris.ui.drawer).toBeNull();
      });

      it("allows new drawer to be created", function() {
        expect(() => { new tabris.Drawer(); }).not.toThrow();
        expect(nativeBridge.calls({op: "create", type: "tabris.Drawer"}).length).toBe(1);
      });

    });

  });

});
