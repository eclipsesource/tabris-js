describe("_-images", function() {

  describe("imageToArray", function() {

    it("translates object to array", function() {
      var result = _.imageToArray({src: "foo", width: 23, height: 42, scale: 3.14});
      expect(result).toEqual(["foo", 23, 42, 3.14]);
    });

    it("replaces missing width, height, and scale values with null", function() {
      var result = _.imageToArray({src: "foo"});
      expect(result).toEqual(["foo", null, null, null]);
    });

  });

  describe("imageFromArray", function() {

    it("translates array to object", function() {
      var result = _.imageFromArray(["foo", 23, 42, 3.14]);
      expect(result).toEqual({src: "foo", width: 23, height: 42, scale: 3.14});
    });

    it("skips missing width, height, and scale values", function() {
      var result = _.imageFromArray(["foo"]);
      expect(result).toEqual({src: "foo"});
    });

  });

});
