/**
 * Copyright (c) 2014 EclipseSource.
 * All rights reserved.
 */

describe("Device", function() {

  describe("window.devicePixelRatio", function() {

    var device, target;

    beforeEach(function() {
      device = tabris("tabris.Device");
      spyOn(device, "get").and.returnValue(23);
      target = {};
      tabris._addDeviceMethods(target);
    });

    it("provides scaleFactor", function() {
      expect(target.devicePixelRatio).toBe(23);
      expect(device.get).toHaveBeenCalledWith("scaleFactor");
    });

    it("prevents overwriting scaleFactor", function() {
      target.devicePixelRatio = 42;
      expect(target.devicePixelRatio).toBe(23);
    });

  });

});
