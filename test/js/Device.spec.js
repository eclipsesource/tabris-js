/**
 * Copyright (c) 2014 EclipseSource.
 * All rights reserved.
 */

describe("Device", function() {

  var device, target, nativeBridge;

  beforeEach(function() {
    device = tabris("_Device");
    nativeBridge = new NativeBridgeSpy();
    tabris._reset();
    tabris._start(nativeBridge);
  });

  describe("window.device", function() {

    beforeEach(function() {
      spyOn(nativeBridge, "get").and.returnValue(23);
      target = {};
      tabris._addDeviceObject(target);
    });

    it("provides device", function() {
      expect(target.device).toBeDefined();
    });

    it("prevents overwriting device", function() {
      var dev = target.device;
      target.device = 42;
      expect(target.device).toBe(dev);
    });

    it("provides device.model", function() {
      expect(target.device.model).toBe(23);
      expect(nativeBridge.get).toHaveBeenCalledWith("tabris.Device", "model");
    });

    it("prevents overwriting device.model", function() {
      target.device.model = 42;
      expect(target.device.model).toBe(23);
    });

    it("provides device.platform", function() {
      expect(target.device.platform).toBe(23);
      expect(nativeBridge.get).toHaveBeenCalledWith("tabris.Device", "platform");
    });

    it("prevents overwriting device.platform", function() {
      target.device.platform = 42;
      expect(target.device.platform).toBe(23);
    });

    it("provides device.version", function() {
      expect(target.device.version).toBe(23);
      expect(nativeBridge.get).toHaveBeenCalledWith("tabris.Device", "version");
    });

    it("prevents overwriting device.version", function() {
      target.device.version = 42;
      expect(target.device.version).toBe(23);
    });

  });

  describe("window.devicePixelRatio", function() {

    beforeEach(function() {
      spyOn(nativeBridge, "get").and.returnValue(23);
      target = {};
      tabris._addDeviceMethods(target);
    });

    it("provides scaleFactor", function() {
      expect(target.devicePixelRatio).toBe(23);
      expect(nativeBridge.get).toHaveBeenCalledWith("tabris.Device", "scaleFactor");
    });

    it("prevents overwriting scaleFactor", function() {
      target.devicePixelRatio = 42;
      expect(target.devicePixelRatio).toBe(23);
    });

  });

});
