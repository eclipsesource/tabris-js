describe("App", function() {

  var app, nativeBridge;

  beforeEach(function() {
    nativeBridge = new NativeBridgeSpy();
    tabris._reset();
    tabris._init(nativeBridge);
    app = tabris.create("_App");
  });

  it("listens for Pause event", function() {
    var listener = jasmine.createSpy();

    app.on("pause", listener);

    var calls = nativeBridge.calls({id: app.cid, op: "listen", event: "Pause"});
    expect(calls[0].listen).toBe(true);
  });

  it("triggers pause event", function() {
    var listener = jasmine.createSpy();
    app.on("pause", listener);
    tabris._notify(app.cid, "Pause");

    expect(listener).toHaveBeenCalled();
  });

  it("listens for Resume event", function() {
    var listener = jasmine.createSpy();

    app.on("resume", listener);

    var calls = nativeBridge.calls({id: app.cid, op: "listen", event: "Resume"});
    expect(calls[0].listen).toBe(true);
  });

  it("triggers resume event", function() {
    var listener = jasmine.createSpy();
    app.on("resume", listener);
    tabris._notify(app.cid, "Resume");

    expect(listener).toHaveBeenCalled();
  });

  it("can not be disposed", function() {
    expect(function() {
      app.dispose();
    }).toThrow();
  });

  it("listens for backnavigation event", function() {
    app.on("backnavigation", jasmine.createSpy());

    var calls = nativeBridge.calls({id: app.cid, op: "listen", event: "backnavigation"});
    expect(calls[0].listen).toBe(true);
  });

  it("triggers backnavigation event", function() {
    var listener = jasmine.createSpy();
    app.on("backnavigation", listener);

    tabris._notify(app.cid, "backnavigation");

    expect(listener).toHaveBeenCalledWith(app, {});
  });

  it("backnavigation event returns false by default", function() {
    app.on("backnavigation", jasmine.createSpy());

    var returnValue = tabris._notify(app.cid, "backnavigation");

    expect(returnValue).toBe(false);
  });

  it("backnavigation event returns true if preventDefault is true", function() {
    app.on("backnavigation", function(app, options) {
      options.preventDefault = true;
    });

    var returnValue = tabris._notify(app.cid, "backnavigation");

    expect(returnValue).toBe(true);
  });

  describe("reload", function() {

    it("CALLs `reload`", function() {
      spyOn(nativeBridge, "call");

      app.reload();

      expect(nativeBridge.call).toHaveBeenCalledWith(app.cid, "reload", {});
    });

  });

  describe("getResourceLocation", function() {

    beforeEach(function() {
      spyOn(nativeBridge, "get").and.returnValue("/root");
    });

    it("GETs 'resourceBaseUrl'", function() {
      app.getResourceLocation();

      expect(nativeBridge.get).toHaveBeenCalledWith(app.cid, "resourceBaseUrl");
    });

    it("GETs 'resourceBaseUrl' only once", function() {
      app.getResourceLocation();
      app.getResourceLocation();

      expect(nativeBridge.get.calls.count()).toBe(1);
    });

    it("appends normalized parameter", function() {
      var result = app.getResourceLocation("foo//bar");

      expect(result).toBe("/root/foo/bar");
    });

    it("strips leading and trailing slash", function() {
      var result = app.getResourceLocation("/foo/bar/");

      expect(result).toBe("/root/foo/bar");
    });

    it("ignores '.' segments", function() {
      var result = app.getResourceLocation("./foo/bar");

      expect(result).toBe("/root/foo/bar");
    });

    it("throws on '..'", function() {
      expect(function() {
        app.getResourceLocation("../foo");
      }).toThrowError("Path must not contain '..'");
    });

  });

  describe("installPatch", function() {

    var callback, error;

    beforeEach(function() {
      callback = jasmine.createSpy();
      error = {};
    });

    it("fails if parameter is not a string", function() {
      expect(function() {
        app.installPatch(23);
      }).toThrow();
    });

    it("CALLs `installPatch` with URL", function() {
      spyOn(nativeBridge, "call");

      app.installPatch("http://example.com/patch");

      expect(nativeBridge.call).toHaveBeenCalledWith(app.cid, "installPatch", {
        url: "http://example.com/patch"
      });
    });

    it("does not CALL `installPatch` when already pending", function() {
      app.installPatch("http://example.com/patch1");
      spyOn(nativeBridge, "call");

      app.installPatch("http://example.com/patch2");

      expect(nativeBridge.call).not.toHaveBeenCalled();
    });

    it("errors if install already pending", function() {
      app.installPatch("http://example.com/patch");

      app.installPatch("http://example.com/patch", callback);

      expect(callback).toHaveBeenCalledWith(jasmine.any(Error));
      var err = callback.calls.first().args[0];
      expect(err.message).toEqual(jasmine.stringMatching("already pending"));
    });

    it("starts LISTEN on `patchInstall` event", function() {
      spyOn(nativeBridge, "listen");

      app.installPatch("http://example.com/patch");

      expect(nativeBridge.listen).toHaveBeenCalledWith(app.cid, "patchInstall", true);
    });

    describe("on success event with illegal JSON", function() {

      beforeEach(function() {
        app.installPatch("http://example.com/patch", callback);
        spyOn(nativeBridge, "listen");
        spyOn(nativeBridge, "call");

        tabris._notify(app.cid, "patchInstall", {success: "{not json}"});
      });

      it("notifies callback with error", function() {
        expect(callback).toHaveBeenCalledWith(jasmine.any(Error));
        expect(callback.calls.argsFor(0)).toEqual([jasmine.stringMatching("parse")]);
      });

      it("stops LISTEN on `patchInstall` event", function() {
        expect(nativeBridge.listen).toHaveBeenCalledWith(app.cid, "patchInstall", false);
      });

      it("allows for subsequent calls", function() {
        app.installPatch("http://example.com/patch");

        expect(nativeBridge.call).toHaveBeenCalled();
      });

    });

    describe("on success event", function() {

      beforeEach(function() {
        app.installPatch("http://example.com/patch", callback);
        spyOn(nativeBridge, "listen");
        spyOn(nativeBridge, "call");

        tabris._notify(app.cid, "patchInstall", {success: '{"version": 23}'});
      });

      it("notifies callback", function() {
        expect(callback).toHaveBeenCalledWith(null, {version: 23});
      });

      it("stops LISTEN on `patchInstall` event", function() {
        expect(nativeBridge.listen).toHaveBeenCalledWith(app.cid, "patchInstall", false);
      });

      it("allows for subsequent calls", function() {
        app.installPatch("http://example.com/patch");

        expect(nativeBridge.call).toHaveBeenCalled();
      });

    });

    describe("on error event", function() {

      beforeEach(function() {
        app.installPatch("http://example.com/patch", callback);
        spyOn(nativeBridge, "listen");
        spyOn(nativeBridge, "call");

        tabris._notify(app.cid, "patchInstall", {error: error});
      });

      it("notifies callback", function() {
        expect(callback).toHaveBeenCalledWith(new Error(error));
      });

      it("stops LISTEN on `patchInstall` event", function() {
        expect(nativeBridge.listen).toHaveBeenCalledWith(app.cid, "patchInstall", false);
      });

      it("allows for subsequent calls", function() {
        app.installPatch("http://example.com/patch");

        expect(nativeBridge.call).toHaveBeenCalled();
      });

    });

  });

});
