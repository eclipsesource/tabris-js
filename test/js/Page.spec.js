describe("Page", function() {

  var nativeBridge;
  var page;

  beforeEach(function() {
    nativeBridge = new NativeBridgeSpy();
    tabris._reset();
    tabris._init(nativeBridge);
    tabris.ui = tabris.create("_UI");
    spyOn(tabris.ui, "set");
    nativeBridge.resetCalls();
  });

  afterEach(function() {
    delete tabris.ui;
  });

  describe("create", function() {

    beforeEach(function() {
      page = tabris.create("Page", {
        title: "title",
        image: {src: "image"},
        style: "fullscreen",
        topLevel: true,
        background: "red"
      });
    });

    it("creates a Composite and a Page", function() {
      var createCalls = nativeBridge.calls({op: "create"});
      expect(createCalls.length).toBe(2);
      expect(createCalls[0].type).toBe("rwt.widgets.Composite");
      expect(createCalls[1].type).toBe("tabris.Page");
    });

    describe("created Composite", function() {

      var createProps, setProps;

      beforeEach(function() {
        var createCall = nativeBridge.calls({op: "create", type: "rwt.widgets.Composite"})[0];
        createProps = createCall.properties;
        var setCall = nativeBridge.calls({op: "set", id: createCall.id})[0];
        setProps = setCall.properties;
      });

      it("parent is set to shell after create", function() {
        expect(setProps.parent).toEqual(tabris.ui._shell.cid);
      });

      it("is full-size", function() {
        expect(createProps.layoutData).toEqual({left: 0, right: 0, top: 0, bottom: 0});
      });

      it("does not inherit page properties", function() {
        expect(createProps.title).not.toBeDefined();
        expect(createProps.image).not.toBeDefined();
        expect(createProps.style).not.toBeDefined();
        expect(createProps.topLevel).not.toBeDefined();
      });

      it("has non-page properties", function() {
        expect(createProps.background).toEqual([255, 0, 0, 255]);
      });

    });

    describe("created Page", function() {

      var properties;

      beforeEach(function() {
        var createCall = nativeBridge.calls({op: "create", type: "tabris.Page"})[0];
        properties = createCall.properties;
      });

      it("parent is set to tabris.UI", function() {
        expect(properties.parent).toBe(tabris.ui.cid);
      });

      it("control is set to composite", function() {
        expect(properties.control).toBe(page.cid);
      });

      it("has title, image and topLevel properties", function() {
        expect(properties.title).toBe("title");
        expect(properties.image).toEqual(["image", null, null, null]);
        expect(properties.style).toBe("fullscreen");
        expect(properties.topLevel).toBe(true);
      });

      it("does not inherit non-page properties", function() {
        expect(properties.background).not.toBeDefined();
      });

    });

  });

  describe("when created", function() {
    var pageCreateCall;
    var compositeCreateCall;

    beforeEach(function() {
      page = tabris.create("Page");
      pageCreateCall = nativeBridge.calls({op: "create", type: "tabris.Page"})[0];
      compositeCreateCall = nativeBridge.calls({op: "create", type: "rwt.widgets.Composite"})[0];
      nativeBridge.resetCalls();
    });

    describe("when a child is appended", function() {
      var child;

      beforeEach(function() {
        child = tabris.create("Composite");
        nativeBridge.resetCalls();
        page.append(child);
      });

      it("sets child's parent to the composite", function() {
        var call = nativeBridge.calls({op: "set", id: child.cid})[0];
        expect(call.properties.parent).toEqual(compositeCreateCall.id);
      });

    });

    describe("set", function() {

      it("modifies the page", function() {
        page.set("title", "foo");

        var setCalls = nativeBridge.calls({op: "set", id: pageCreateCall.id});
        expect(setCalls.length).toBe(1);
        expect(setCalls[0].properties.title).toEqual("foo");
      });

      it("modifies the composite", function() {
        page.set("background", "red");

        var setCalls = nativeBridge.calls({op: "set", id: compositeCreateCall.id});
        expect(setCalls.length).toBe(1);
        expect(setCalls[0].properties.background).toEqual([255, 0, 0, 255]);
      });

    });

    describe("open", function() {

      it("sets active page", function() {
        page.open();

        expect(tabris.ui.set).toHaveBeenCalledWith("activePage", page);
      });

      it("returns self to allow chaining", function() {
        var result = page.open();

        expect(result).toBe(page);
      });

    });

    describe("close", function() {

      it("destroys composite and page", function() {
        page.open();

        page.close();

        var destroyCalls = nativeBridge.calls({op: "destroy"});
        // page must be destroyed before composite, see issue 253
        expect(destroyCalls[0].id).toBe(pageCreateCall.id);
        expect(destroyCalls[1].id).toBe(compositeCreateCall.id);
      });

    });

    describe("appending a widget", function() {
      var child;

      beforeEach(function() {
        child = tabris.create("Composite");
        nativeBridge.resetCalls();
        page.append(child);
      });

      it("uses page's composite in 'set'", function() {
        var call = nativeBridge.calls({op: "set", id: child.cid})[0];
        expect(call.properties.parent).toBe(page.cid);
      });

    });

  });

});
