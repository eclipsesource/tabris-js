describe("Device", function() {

  var device, results, nativeBridge;

  beforeEach(function() {
    nativeBridge = new NativeBridgeSpy();
    results = {};
    spyOn(nativeBridge, "get").and.callFake(function(id, name) {
      if (id === "tabris.Device") {
        return results[name];
      }
    });
    tabris._reset();
    tabris._init(nativeBridge);
    device = new tabris._Device();
  });

  it("provides model", function() {
    results.model = "x1";
    expect(device.get("model")).toBe("x1");
  });

  it("provides platform", function() {
    results.platform = "foo";
    expect(device.get("platform")).toBe("foo");
  });

  it("provides version", function() {
    results.version = "23";
    expect(device.get("version")).toBe("23");
  });

  it("provides language", function() {
    results.language = "es";
    expect(device.get("language")).toBe("es");
  });

  it("provides screenWidth", function() {
    results.screenWidth = 23;
    expect(device.get("screenWidth")).toBe(23);
  });

  it("provides screenHeight", function() {
    results.screenHeight = 23;
    expect(device.get("screenHeight")).toBe(23);
  });

  it("provides orientation", function() {
    results.orientation = "portrait";
    expect(device.get("orientation")).toBe("portrait");
  });

  it("adds listener for orientationchange event", function() {
    device.on("change:orientation", function() {});

    var calls = nativeBridge.calls({id: "tabris.Device", op: "listen", event: "orientationchange"});
    expect(calls[0].listen).toBe(true);
  });

  it("triggers change:orientation event", function() {
    var listener = jasmine.createSpy("listener");
    device.on("change:orientation", listener);

    tabris._notify("tabris.Device", "orientationchange", {orientation: "portrait"});

    expect(listener.calls.argsFor(0)[0]).toBe(device);
    expect(listener.calls.argsFor(0)[1]).toBe("portrait");
  });

  it("prevents overwriting properties", function() {
    results.language = "es";
    device.set("language", "fr");
    expect(device.get("language")).toBe("es");
  });

  it("can not be disposed", function() {
    expect(function() {
      device.dispose();
    }).toThrow();
  });

  it("is available as tabris.device", function() {
    expect(tabris.device).toEqual(jasmine.any(tabris._Device));
  });

});

describe("publishDeviceProperties", function() {

  var target, results, nativeBridge;

  beforeEach(function() {
    nativeBridge = new NativeBridgeSpy();
    results = {};
    spyOn(nativeBridge, "get").and.callFake(function(id, name) {
      if (id === "tabris.Device") {
        return results[name];
      }
    });
    tabris._reset();
    tabris._init(nativeBridge);
  });

  describe("when device exists", function() {

    var orig;

    beforeEach(function() {
      orig = {};
      target = {device: orig};
      tabris._publishDeviceProperties(target);
    });

    it("does not modify device", function() {
      expect(target.device).toBe(orig);
    });

  });

  describe("when device does not exist", function() {

    beforeEach(function() {
      target = {};
      tabris._publishDeviceProperties(target);
    });

    it("creates device", function() {
      expect(target.device).toBeDefined();
    });

    it("allows overwriting device", function() {
      // See #785
      target.device = 42;
      expect(target.device).toBe(42);
    });

    it("provides device.model", function() {
      results.model = "x1";
      expect(target.device.model).toBe("x1");
    });

    it("prevents overwriting device.model", function() {
      results.model = "x1";
      target.device.model = "x2";
      expect(target.device.model).toBe("x1");
    });

    it("provides device.platform", function() {
      results.platform = "foo";
      expect(target.device.platform).toBe("foo");
    });

    it("prevents overwriting device.platform", function() {
      results.platform = "foo";
      target.device.platform = "bar";
      expect(target.device.platform).toBe("foo");
    });

    it("provides device.version", function() {
      results.version = "23";
      expect(target.device.version).toBe("23");
    });

    it("prevents overwriting device.version", function() {
      results.version = "23";
      target.device.version = "42";
      expect(target.device.version).toBe("23");
    });

  });

  describe("when devicePixelRatio exists", function() {

    beforeEach(function() {
      target = {
        devicePixelRatio: 23
      };
      tabris._publishDeviceProperties(target);
    });

    it("does not change devicePixelRatio", function() {
      expect(target.devicePixelRatio).toBe(23);
    });

  });

  describe("when devicePixelRatio does not exist", function() {

    beforeEach(function() {
      target = {};
      results.scaleFactor = 23;
      tabris._publishDeviceProperties(target);
    });

    it("provides devicePixelRatio", function() {
      expect(target.devicePixelRatio).toBe(23);
    });

    it("allows overwriting devicePixelRatio", function() {
      // Browsers also allow overwriting
      target.devicePixelRatio = 42;
      expect(target.devicePixelRatio).toBe(42);
    });

  });

  describe("when navigator does not exist", function() {

    beforeEach(function() {
      target = {};
      tabris._publishDeviceProperties(target);
    });

    it("does not create navigator", function() {
      expect(target.navigator).not.toBeDefined();
    });

  });

  describe("when navigator.language exists", function() {

    beforeEach(function() {
      target = {
        navigator: {
          language: "es"
        }
      };
      tabris._publishDeviceProperties(target);
    });

    it("does not change navigator.language", function() {
      expect(target.navigator.language).toBe("es");
    });

  });

  describe("when navigator.language does not exist", function() {

    beforeEach(function() {
      target = {
        navigator: {}
      };
      tabris._publishDeviceProperties(target);
    });

    it("provides navigator.language", function() {
      results.language = "es";
      expect(target.navigator.language).toBe("es");
    });

    it("prevents overwriting navigator.language", function() {
      results.language = "es";
      target.navigator.language = "fr";
      expect(target.navigator.language).toBe("es");
    });

  });

  describe("when screen exists", function() {

    beforeEach(function() {
      target = {
        screen: {}
      };
      tabris._publishDeviceProperties(target);
    });

    it("does not modify screen", function() {
      expect(target.screen).toEqual({});
    });

  });

  describe("when screen does not exist", function() {

    beforeEach(function() {
      target = {};
      tabris._publishDeviceProperties(target);
    });

    it("creates screen", function() {
      expect(target.screen).toBeDefined();
    });

    it("allows overwriting screen", function() {
      // Browsers also allow overwriting
      target.screen = 23;
      expect(target.screen).toBe(23);
    });

  });

});
