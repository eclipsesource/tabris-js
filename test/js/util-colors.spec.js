/**
 * Copyright (c) 2014 EclipseSource.
 * All rights reserved.
 */

describe("Color", function() {

  describe("colorArrayToString", function() {

    it("returns color string in rgba format", function() {
      expect(util.colorArrayToString([170, 255, 0, 128])).toEqual("rgba(170, 255, 0, 0.5)");
    });

    it("accepts arrays with 3 elements", function() {
      expect(util.colorArrayToString([170, 255, 0])).toEqual("rgba(170, 255, 0, 1)");
    });

  });

  describe("colorStringToArray", function() {

    it("accepts color string of form #xxxxxx", function() {
      expect(util.colorStringToArray("#aaff00")).toEqual([170, 255, 0, 255]);
    });

    it("accepts color string of form #xxxxxx with mixed upper/lower case", function() {
      expect(util.colorStringToArray("#aaFF00")).toEqual([170, 255, 0, 255]);
    });

    it("accepts color string of form #xxx", function() {
      expect(util.colorStringToArray("#af0")).toEqual([170, 255, 0, 255]);
    });

    it("accepts color string of form #xxx with mixed upper/lower case", function() {
      expect(util.colorStringToArray("#aF0")).toEqual([170, 255, 0, 255]);
    });

    it("accepts rgb function strings", function() {
      expect(util.colorStringToArray("rgb(12, 34, 56)")).toEqual([12, 34, 56, 255]);
    });

    it("clips out-of-range values in rgb", function() {
      expect(util.colorStringToArray("rgb(-12, 34, 560)")).toEqual([0, 34, 255, 255]);
    });

    it("rejects rgb function strings with wrong argument count", function() {
      expect(function() {
        util.colorStringToArray("rgb(23, 42)");
      }).toThrow();
    });

    it("rejects rgb function strings with illegal format in argument", function() {
      expect(function() {
        util.colorStringToArray("rgb(xxx, 23, 42)");
      }).toThrow();
    });

    it("accepts rgba function strings", function() {
      expect(util.colorStringToArray("rgba(12, 34, 56, 0.5)")).toEqual([12, 34, 56, 128]);
    });

    it("clips out-of-range values in rgba", function() {
      expect(util.colorStringToArray("rgba(-12, 34, 560, 2.5)")).toEqual([0, 34, 255, 255]);
    });

    it("rejects rgba function strings with wrong argument count", function() {
      expect(function() {
        util.colorStringToArray("rgba(23, 42, 47)");
      }).toThrow();
    });

    it("rejects rgba function strings with illegal format in color value", function() {
      expect(function() {
        util.colorStringToArray("rgba(xxx, 23, 42)");
      }).toThrow();
    });

    it("rejects rgba function strings with illegal format in alpha value", function() {
      expect(function() {
        util.colorStringToArray("rgba(0, 23, 42, 2..0)");
      }).toThrow();
    });

    it("accepts color names", function() {
      expect(util.colorStringToArray("navy")).toEqual([0, 0, 128, 255]);
    });

    it("accepts 'transparent'", function() {
      expect(util.colorStringToArray("transparent")).toEqual([0, 0, 0, 0]);
    });

    it("rejects unknown strings", function() {
      expect(function() {
        util.colorStringToArray("unknown");
      }).toThrow();
    });

  });

});
