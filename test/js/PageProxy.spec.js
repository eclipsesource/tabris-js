/**
 * Copyright (c) 2014 EclipseSource.
 * All rights reserved.
 */

describe("PageProxy", function() {

  var nativeBridge;
  var pageProxy;
  var uiId = "uiId";

  beforeEach(function() {
    nativeBridge = new NativeBridgeSpy();
    tabris._reset();
    tabris._start(nativeBridge);
    tabris._shell = new tabris.Proxy("shellId");
    tabris._uiProxy = jasmine.createSpyObj("uiProxy", ["setActivePage", "setLastActivePage"]);
    tabris._uiProxy._ui = new tabris.Proxy(uiId);
    pageProxy = new tabris.Page();
  });

  afterEach(function() {
    delete tabris._uiProxy;
  });

  it("is instance of Proxy", function() {
    expect(pageProxy).toEqual(jasmine.any(tabris.Proxy));
  });

  describe("create", function() {

    it("creates a Composite and a Page", function() {
      pageProxy._create({});

      var createCalls = nativeBridge.calls({op: "create"});
      expect(createCalls.length).toBe(2);
      expect(createCalls[0].type).toBe("rwt.widgets.Composite");
      expect(createCalls[1].type).toBe("tabris.Page");
    });

    describe("created Composite", function() {

      var createCall;

      beforeEach(function() {
        pageProxy._create({
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
        pageProxy._create({
          title: "title",
          image: "image",
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
        expect(createCall.properties.image).toBe("image");
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
      pageProxy._create({});
      pageCreateCall = nativeBridge.calls({op: "create", type: "tabris.Page"})[0];
      compositeCreateCall = nativeBridge.calls({op: "create", type: "rwt.widgets.Composite"})[0];
      nativeBridge.resetCalls();
    });

    describe("append with type and properties", function() {
      var result;

      beforeEach(function() {
        result = pageProxy.append("foo.Bar", {bar: 23});
      });

      it("appends to the composite", function() {
        var call = nativeBridge.calls({op: "create", type: "foo.Bar"})[0];
        expect(call.properties.parent).toEqual(compositeCreateCall.id);
      });

      it("returns self to allow chaining", function() {
        expect(result).toBe(pageProxy);
      });

    });

    describe("append with proxy", function() {
      var result, child;

      beforeEach(function() {
        child = new tabris.Proxy("child");
        result = pageProxy.append(child);
      });

      it("sets child's parent to the composite", function() {
        var call = nativeBridge.calls({op: "set", id: child.id})[0];
        expect(call.properties.parent).toEqual(compositeCreateCall.id);
      });

      it("returns self to allow chaining", function() {
        expect(result).toBe(pageProxy);
      });

    });

    describe("set", function() {

      it("modifies the page", function() {
        pageProxy.set("title", "foo");

        var setCalls = nativeBridge.calls({op: "set", id: pageCreateCall.id});
        expect(setCalls.length).toBe(1);
        expect(setCalls[0].properties.title).toEqual("foo");
      });

      it("modifies the composite", function() {
        pageProxy.set("background", "red");

        var setCalls = nativeBridge.calls({op: "set", id: compositeCreateCall.id});
        expect(setCalls.length).toBe(1);
        expect(setCalls[0].properties.background).toEqual([255, 0, 0, 255]);
      });

    });

    describe("open", function() {

      it("sets active page", function() {
        pageProxy.open();

        expect(tabris._uiProxy.setActivePage).toHaveBeenCalledWith(pageProxy);
      });

    });

    describe("close", function() {

      it("restores previous active page", function() {
        pageProxy.open();

        pageProxy.close();

        expect(tabris._uiProxy.setLastActivePage).toHaveBeenCalled();
      });

      it("destroys composite and page", function() {
        pageProxy.open();

        pageProxy.close();

        expect(nativeBridge.calls({op: "destroy", id: pageCreateCall.id}).length).toBe(1);
        expect(nativeBridge.calls({op: "destroy", id: compositeCreateCall.id}).length).toBe(1);
      });

    });

    describe("setting as a parent", function() {
      var child;

      beforeEach(function() {
        child = new tabris.Proxy();
        nativeBridge.resetCalls();
        child.set("parent", pageProxy);
      });

      it("uses page's composite in 'set'", function() {
        var call = nativeBridge.calls({op: "set", id: child.id})[0];
        expect(call.properties.parent).toBe(pageProxy._composite.id);
      });

    });

    describe("setting a page as a parent", function() {
      var child;

      beforeEach(function() {
        child = new tabris.Proxy();
        nativeBridge.resetCalls();
        child.set("parent", pageProxy);
      });

      it("translates the parent to the page's composite in the protocol", function() {
        var call = nativeBridge.calls({op: "set", id: child.id})[0];
        expect(call.properties.parent).toBe(pageProxy._composite.id);
      });
    });

  });

});
