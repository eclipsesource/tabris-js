/**
 * Copyright (c) 2014 EclipseSource.
 * All rights reserved.
 */

describe("Device", function() {

  describe("window.devicePixelRatio", function() {

    var device, target, nativeBridge;

    beforeEach(function() {
      device = tabris("_Device");
      nativeBridge = new NativeBridgeSpy();
      tabris._reset();
      tabris._start(nativeBridge);
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
