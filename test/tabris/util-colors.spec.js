describe("Color", function() {

  describe("colorArrayToString", function() {

    it("returns color string in rgba format", function() {
      expect(_.colorArrayToString([170, 255, 0, 128])).toEqual("rgba(170, 255, 0, 0.5)");
    });

    it("accepts arrays with 3 elements", function() {
      expect(_.colorArrayToString([170, 255, 0])).toEqual("rgba(170, 255, 0, 1)");
    });

  });

  describe("colorStringToArray", function() {

    it("accepts color string of form #xxxxxx", function() {
      expect(_.colorStringToArray("#aaff00")).toEqual([170, 255, 0, 255]);
    });

    it("accepts color string of form #xxxxxx with mixed upper/lower case", function() {
      expect(_.colorStringToArray("#aaFF00")).toEqual([170, 255, 0, 255]);
    });

    it("accepts color string of form #xxx", function() {
      expect(_.colorStringToArray("#af0")).toEqual([170, 255, 0, 255]);
    });

    it("accepts color string of form #xxx with mixed upper/lower case", function() {
      expect(_.colorStringToArray("#aF0")).toEqual([170, 255, 0, 255]);
    });

    it("accepts rgb function strings", function() {
      expect(_.colorStringToArray("rgb(12, 34, 56)")).toEqual([12, 34, 56, 255]);
    });

    it("clips out-of-range values in rgb", function() {
      expect(_.colorStringToArray("rgb(-12, 34, 560)")).toEqual([0, 34, 255, 255]);
    });

    it("rejects rgb function strings with wrong argument count", function() {
      expect(() => {
        _.colorStringToArray("rgb(23, 42)");
      }).toThrow();
    });

    it("rejects rgb function strings with illegal format in argument", function() {
      expect(() => {
        _.colorStringToArray("rgb(xxx, 23, 42)");
      }).toThrow();
    });

    it("accepts rgba function strings", function() {
      expect(_.colorStringToArray("rgba(12, 34, 56, 0.5)")).toEqual([12, 34, 56, 128]);
    });

    it("clips out-of-range values in rgba", function() {
      expect(_.colorStringToArray("rgba(-12, 34, 560, 2.5)")).toEqual([0, 34, 255, 255]);
    });

    it("rejects rgba function strings with wrong argument count", function() {
      expect(() => {
        _.colorStringToArray("rgba(23, 42, 47)");
      }).toThrow();
    });

    it("rejects rgba function strings with illegal format in color value", function() {
      expect(() => {
        _.colorStringToArray("rgba(xxx, 23, 42)");
      }).toThrow();
    });

    it("rejects rgba function strings with illegal format in alpha value", function() {
      expect(() => {
        _.colorStringToArray("rgba(0, 23, 42, 2..0)");
      }).toThrow();
    });

    it("accepts color names", function() {
      expect(_.colorStringToArray("navy")).toEqual([0, 0, 128, 255]);
    });

    it("accepts 'transparent'", function() {
      expect(_.colorStringToArray("transparent")).toEqual([0, 0, 0, 0]);
    });

    it("rejects unknown strings", function() {
      expect(() => {
        _.colorStringToArray("unknown");
      }).toThrow();
    });

  });

});
