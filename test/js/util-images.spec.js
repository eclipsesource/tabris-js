/**
 * Copyright (c) 2014 EclipseSource.
 * All rights reserved.
 */

describe("util-images", function() {

  describe("imageToArray", function() {

    it("translates object to array", function() {
      var result = util.imageToArray({src: "foo", width: 23, height: 42, scale: 3.14});
      expect(result).toEqual(["foo", 23, 42, 3.14]);
    });

    it("replaces missing width, height, and scale values with null", function() {
      var result = util.imageToArray({src: "foo"});
      expect(result).toEqual(["foo", null, null, null]);
    });

  });

  describe("imageFromArray", function() {

    it("translates array to object", function() {
      var result = util.imageFromArray(["foo", 23, 42, 3.14]);
      expect(result).toEqual({src: "foo", width: 23, height: 42, scale: 3.14});
    });

    it("skips missing width, height, and scale values", function() {
      var result = util.imageFromArray(["foo"]);
      expect(result).toEqual({src: "foo"});
    });

  });

});
