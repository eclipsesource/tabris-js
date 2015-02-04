describe("Device", function() {

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

    beforeEach(function() {
      target = {
        device: {}
      };
      tabris._publishDeviceProperties(target);
    });

    it("does not modify device", function() {
      expect(target.device).toEqual({});
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

    it("prevents overwriting device", function() {
      var dev = target.device;
      target.device = 42;
      expect(target.device).toBe(dev);
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

    it("provides device.language", function() {
      results.language = "es";
      expect(target.device.language).toBe("es");
    });

    it("prevents overwriting device.language", function() {
      results.language = "es";
      target.device.language = "fr";
      expect(target.device.language).toBe("es");
    });

    it("provides screen.width", function() {
      results.screenWidth = 23;
      expect(target.device.screen.width).toBe(23);
    });

    it("prevents overwriting screen.width", function() {
      results.screenWidth = 23;
      target.device.screen.width = 42;
      expect(target.device.screen.width).toBe(23);
    });

    it("provides screen.height", function() {
      results.screenHeight = 23;
      expect(target.device.screen.height).toBe(23);
    });

    it("prevents overwriting screen.height", function() {
      results.screenHeight = 23;
      target.device.screen.height = 42;
      expect(target.device.screen.height).toBe(23);
    });

    it("prevents overwriting screen", function() {
      var scr = target.device.screen;
      target.device.screen = {};
      expect(target.device.screen).toBe(scr);
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
      tabris._publishDeviceProperties(target);
    });

    it("provides devicePixelRatio", function() {
      results.scaleFactor = 23;
      expect(target.devicePixelRatio).toBe(23);
    });

    it("prevents overwriting devicePixelRatio", function() {
      results.scaleFactor = 23;
      target.devicePixelRatio = 42;
      expect(target.devicePixelRatio).toBe(23);
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

    it("screen is the same as device.screen", function() {
      expect(target.screen).toBe(target.device.screen);
    });

    it("prevents overwriting screen", function() {
      var scr = target.screen;
      target.screen = {};
      expect(target.screen).toBe(scr);
    });

  });

});
