describe("ImageData", function() {

  var data;
  var array = new Uint8ClampedArray(60);

  describe("constructor", function() {

    it("fails with less than 2 parameters", function() {
      expect(function() {
        data = new tabris.ImageData(1);
      }).toThrow();
    });

  });

  describe("constructor without array", function() {

    [0, -1, NaN, "foo", {}].forEach(function(value) {

      it("rejects illegal width (" + value + ")", function() {
        expect(function() {
          data = new tabris.ImageData(value, 1);
        }).toThrow();
      });

      it("rejects illegal height (" + value + ")", function() {
        expect(function() {
          data = new tabris.ImageData(1, value);
        }).toThrow();
      });

    });

    it("converts width to integer", function() {
      data = new tabris.ImageData(3.7, 5);

      expect(data.width).toBe(3);
    });

    it("converts height to integer", function() {
      data = new tabris.ImageData(3, 5.7);

      expect(data.height).toBe(5);
    });

    it("sets width and height properties", function() {
      data = new tabris.ImageData(3, 5);

      expect(data.width).toBe(3);
      expect(data.height).toBe(5);
    });

    it("creates data array", function() {
      data = new tabris.ImageData(3, 5);

      expect(data.data).toEqual(jasmine.any(Uint8ClampedArray));
      expect(data.data.byteLength).toBe(60);
      for (var i = 0; i < data.data.byteLength; i++) {
        expect(data.data[i]).toBe(0);
      }
    });

  });

  describe("constructor with array", function() {

    [0, -1, NaN, "foo", {}].forEach(function(value) {

      it("rejects illegal width (" + value + ")", function() {
        expect(function() {
          data = new tabris.ImageData(array, value, 5);
        }).toThrow();
      });

      it("rejects illegal height (" + value + ")", function() {
        expect(function() {
          data = new tabris.ImageData(array, 3, value);
        }).toThrow();
      });

    });

    it("converts width to integer", function() {
      data = new tabris.ImageData(array, 3.7, 5);

      expect(data.width).toBe(3);
    });

    it("converts height to integer", function() {
      data = new tabris.ImageData(array, 3, 5.7);

      expect(data.height).toBe(5);
    });

    it("rejects array of wrong size", function() {
      expect(function() {
        data = new tabris.ImageData(new Uint8ClampedArray(64), 3, 5);
      }).toThrow();
    });

    it("rejects array of illegal size", function() {
      expect(function() {
        data = new tabris.ImageData(new Uint8ClampedArray(33), 3);
      }).toThrow();
    });

    it("sets width, height, and data properties", function() {
      data = new tabris.ImageData(array, 3, 5);

      expect(data.width).toBe(3);
      expect(data.height).toBe(5);
      expect(data.data).toBe(array);
    });

    it("calculates missing height property", function() {
      data = new tabris.ImageData(array, 3);

      expect(data.width).toBe(3);
      expect(data.height).toBe(5);
    });

  });

  describe("properties", function() {

    it("are read-only", function() {
      data = new tabris.ImageData(array, 3, 5);

      data.width = 7;
      data.height = 9;
      data.data = null;

      expect(data.width).toBe(3);
      expect(data.height).toBe(5);
      expect(data.data).toBe(array);
    });

  });

});
