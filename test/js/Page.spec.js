/**
 * Copyright (c) 2014 EclipseSource.
 * All rights reserved.
 */

describe("Page", function() {

  var nativeBridge;
  var page;
  var uiId = "uiId";

  beforeEach(function() {
    nativeBridge = new NativeBridgeSpy();
    tabris._reset();
    tabris._start(nativeBridge);
    tabris._shell = new tabris.Proxy("shellId");
    tabris._uiProxy = jasmine.createSpyObj("uiProxy", ["setActivePage", "setLastActivePage"]);
    tabris._uiProxy._ui = new tabris.Proxy(uiId);
    page = new tabris.Page();
  });

  afterEach(function() {
    delete tabris._uiProxy;
  });

  it("is instance of Proxy", function() {
    expect(page).toEqual(jasmine.any(tabris.Proxy));
  });

  describe("create", function() {

    it("creates a Composite and a Page", function() {
      page._create({});

      var createCalls = nativeBridge.calls({op: "create"});
      expect(createCalls.length).toBe(2);
      expect(createCalls[0].type).toBe("rwt.widgets.Composite");
      expect(createCalls[1].type).toBe("tabris.Page");
    });

    describe("created Composite", function() {

      var createCall;

      beforeEach(function() {
        page._create({
          title: "title",
          image: "image",
          style: "fullscreen",
          topLevel: true,
          background: "red"
        });
        createCall = nativeBridge.calls({op: "create", type: "rwt.widgets.Composite"})[0];
      });

      it("parent is shell", function() {
        expect(createCall.properties.parent).toEqual(tabris._shell.id);
      });

      it("is full-size", function() {
        expect(createCall.properties.layoutData).toEqual({left: 0, right: 0, top: 0, bottom: 0});
      });

      it("does not inherit page properties", function() {
        expect(createCall.properties.title).not.toBeDefined();
        expect(createCall.properties.image).not.toBeDefined();
        expect(createCall.properties.style).not.toBeDefined();
        expect(createCall.properties.topLevel).not.toBeDefined();
      });

      it("has non-page properties", function() {
        expect(createCall.properties.background).toEqual([255, 0, 0, 255]);
      });

    });

    describe("created Page", function() {

      var createCall;
      var compositeId;

      beforeEach(function() {
        page._create({
          title: "title",
          image: {src: "image"},
          style: "fullscreen",
          topLevel: true,
          background: "red"
        });
        createCall = nativeBridge.calls({op: "create", type: "tabris.Page"})[0];
        compositeId = nativeBridge.calls({op: "create", type: "rwt.widgets.Composite"})[0].id;
      });

      it("parent is set to tabris.UI", function() {
        expect(createCall.properties.parent).toBe(uiId);
      });

      it("control is set to composite", function() {
        expect(createCall.properties.control).toBe(compositeId);
      });

      it("has title, image and topLevel properties", function() {
        expect(createCall.properties.title).toBe("title");
        expect(createCall.properties.image).toEqual(["image", null, null, null]);
        expect(createCall.properties.style).toBe("fullscreen");
        expect(createCall.properties.topLevel).toBe(true);
      });

      it("does not inherit non-page properties", function() {
        expect(createCall.properties.background).not.toBeDefined();
      });

    });

  });

  describe("when created", function() {
    var pageCreateCall;
    var compositeCreateCall;

    beforeEach(function() {
      page._create({});
      pageCreateCall = nativeBridge.calls({op: "create", type: "tabris.Page"})[0];
      compositeCreateCall = nativeBridge.calls({op: "create", type: "rwt.widgets.Composite"})[0];
      nativeBridge.resetCalls();
    });

    describe("when a child is appended", function() {
      var child;

      beforeEach(function() {
        child = new tabris.Proxy("child");
        page.append(child);
      });

      it("sets child's parent to the composite", function() {
        var call = nativeBridge.calls({op: "set", id: child.id})[0];
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

        expect(tabris._uiProxy.setActivePage).toHaveBeenCalledWith(page);
      });

    });

    describe("close", function() {

      it("restores previous active page", function() {
        page.open();

        page.close();

        expect(tabris._uiProxy.setLastActivePage).toHaveBeenCalled();
      });

      it("destroys composite and page", function() {
        page.open();

        page.close();

        expect(nativeBridge.calls({op: "destroy", id: pageCreateCall.id}).length).toBe(1);
        expect(nativeBridge.calls({op: "destroy", id: compositeCreateCall.id}).length).toBe(1);
      });

    });

    describe("appending a widget", function() {
      var child;

      beforeEach(function() {
        child = new tabris.Proxy();
        nativeBridge.resetCalls();
        page.append(child);
      });

      it("uses page's composite in 'set'", function() {
        var call = nativeBridge.calls({op: "set", id: child.id})[0];
        expect(call.properties.parent).toBe(page._composite.id);
      });

    });

  });

});
