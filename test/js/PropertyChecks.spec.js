/*******************************************************************************
 * Copyright (c) 2014 EclipseSource and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *    EclipseSource - initial API and implementation
 ******************************************************************************/

describe("PropertyChecks:", function() {

  var consoleBackup = window.console;

  beforeEach(function() {
    window.console = jasmine.createSpyObj("console", ["log", "info", "warn", "error"]);
  });

  afterEach(function() {
    window.console = consoleBackup;
  });

  describe("layoutData", function() {

    var check = tabris.PropertyChecks.layoutData;

    it("raises a warning for incomplete horizontal layoutData", function() {
      check({top: 0});

      var warning = "Incomplete layoutData: either left, right or centerX should be specified";
      expect(console.warn).toHaveBeenCalledWith(warning);
    });

    it("raises a warning for incomplete vertical layoutData", function() {
      check({left: 0});

      var warning = "Incomplete layoutData: either top, bottom, centerY, or baseline should be specified";
      expect(console.warn).toHaveBeenCalledWith(warning);
    });

    it("raises a warning for inconsistent layoutData (centerX)", function() {
      check({top: 0, left: 0, centerX: 0});

      var warning = "Inconsistent layoutData: centerX overrides left and right";
      expect(console.warn).toHaveBeenCalledWith(warning);
    });

    it("skips overridden properties from layoutData (centerX)", function() {
      var result = check({top: 1, left: 2, right: 3, centerX: 4});

      expect(result).toEqual({top: 1, centerX: 4});
    });

    it("raises a warning for inconsistent layoutData (centerY)", function() {
      check({left: 0, top: 0, centerY: 0});

      var warning = "Inconsistent layoutData: centerY overrides top and bottom";
      expect(console.warn).toHaveBeenCalledWith(warning);
    });

    it("skips overridden properties from layoutData (centerY)", function() {
      var result = check({left: 1, top: 2, bottom: 3, centerY: 4});

      expect(result).toEqual({left: 1, centerY: 4});
    });

    it("raises a warning for inconsistent layoutData (baseline)", function() {
      check({left: 0, top: 0, baseline: 0});

      var warning = "Inconsistent layoutData: baseline overrides top, bottom, and centerY";
      expect(console.warn).toHaveBeenCalledWith(warning);
    });

    it("skips overridden properties from layoutData (baseline)", function() {
      var result = check({left: 1, top: 2, bottom: 3, centerY: 4, baseline: "other"});

      expect(result).toEqual({left: 1, baseline: "other"});
    });

  });

  describe("image", function() {

    var check = tabris.PropertyChecks.image;

    it("succeeds for minimal image value", function() {
      var result = check({src: "foo.png"});

      expect(result).toEqual({src: "foo.png"});
      expect(console.warn).not.toHaveBeenCalled();
    });

    it("succeeds for image with width and height", function() {
      var result = check({src: "foo.png", width: 10, height: 10});

      expect(result).toEqual({src: "foo.png", width: 10, height: 10});
      expect(console.warn).not.toHaveBeenCalled();
    });

    it("converts given string to image object with src", function() {
      expect(check("foo.jpg")).toEqual({src: "foo.jpg"});
    });

    it("fails if image value is null", function() {
      expect(function() {
        check(null);
      }).toThrow(new Error("Not an image: null"));
    });

    it("fails if image value is not an object", function() {
      expect(function() {
        check(23);
      }).toThrow(new Error("Not an image: 23"));
    });

    it("fails if src is undefined", function() {
      expect(function() {
        check({});
      }).toThrow(new Error("image.src is not a string"));
    });

    it("fails if src is empty string", function() {
      expect(function() {
        check({src: ""});
      }).toThrow(new Error("image.src is an empty string"));
    });

    it("fails if width/height/scale values are invalid number", function() {
      var goodValues = [0, 1, 1 / 3, 0.5, Math.PI];
      var badValues = [-1, NaN, 1 / 0, -1 / 0, "1", true, false, {}];
      var props = ["width", "height", "scale"];
      var checkWith = function(prop, value) {
        var image = {src: "foo"};
        image[prop] = value;
        check(image);
      };

      props.forEach(function(prop) {
        goodValues.forEach(function(value) {
          expect(function() { checkWith(prop, value); }).not.toThrow();
        });
        badValues.forEach(function(value) {
          var error = new Error("image." + prop + " is not a dimension: " + value);
          expect(function() { checkWith(prop, value); }).toThrow(error);
        });
      });
    });

    it("warns if scale and width are given", function() {
      check({src: "foo.png", width: 23, scale: 2});

      var warning = "Image scale is ignored if width or height are given";
      expect(console.warn).toHaveBeenCalledWith(warning);
    });

    it("warns if scale and height are given", function() {
      check({src: "foo.png", height: 23, scale: 2});

      var warning = "Image scale is ignored if width or height are given";
      expect(console.warn).toHaveBeenCalledWith(warning);
    });

  });

  describe("boolean", function() {

    var check = tabris.PropertyChecks.boolean;

    it("passes through true", function() {
      expect(check(true)).toBe(true);
    });

    it("passes through false", function() {
      expect(check(false)).toBe(false);
    });

    it("translates falsy values", function() {
      expect(check(null)).toBe(false);
      expect(check("")).toBe(false);
      expect(check(undefined)).toBe(false);
      expect(check(0)).toBe(false);
    });

    it("translates truthy values", function() {
      expect(check(1)).toBe(true);
      expect(check({})).toBe(true);
      expect(check("true")).toBe(true);
      expect(check("false")).toBe(true);
    });

  });

  describe("string", function() {

    var check = tabris.PropertyChecks.string;

    it("translates any value to string", function() {
      expect(check("str")).toBe("str");
      expect(check(23)).toBe("23");
      expect(check(false)).toBe("false");
      expect(check(null)).toBe("null");
      expect(check(undefined)).toBe("undefined");
      expect(check({})).toBe("[object Object]");
      expect(check([1, 2, 3])).toBe("1,2,3");
      expect(check({toString: function() {return "foo";}})).toBe("foo");
    });

  });

  describe("natural", function() {

    var check = tabris.PropertyChecks.natural;

    it("fails for non-numbers", function() {
      var values = ["", "foo", "23", null, undefined, true, false, {}, []];
      values.forEach(function(value) {
        expect(function() {
          check(value);
        }).toThrow(new Error(typeof value + " is not a number: " + value));
      });
    });

    it("fails for invalid numbers", function() {
      var values = [-1, -0.1, NaN, 1 / 0, -1 / 0];
      values.forEach(function(value) {
        expect(function() {
          check(value);
        }).toThrow(new Error("Number is not a valid value: " + value));
      });
    });

    it("accepts natural number including zero", function() {
      expect(check(0)).toBe(0);
      expect(check(1)).toBe(1);
      expect(check(10e10)).toBe(10e10);
    });

    it("rounds given value", function() {
      expect(check(0.4)).toBe(0);
      expect(check(1.1)).toBe(1);
      expect(check(1.9)).toBe(2);
    });

  });

  describe("integer", function() {

    var check = tabris.PropertyChecks.integer;

    it("fails for non-numbers", function() {
      var values = ["", "foo", "23", null, undefined, true, false, {}, []];
      values.forEach(function(value) {
        expect(function() {
          check(value);
        }).toThrow(new Error(typeof value + " is not a number: " + value));
      });
    });

    it("fails for invalid numbers", function() {
      var values = [NaN, 1 / 0, -1 / 0];
      values.forEach(function(value) {
        expect(function() {
          check(value);
        }).toThrow(new Error("Number is not a valid value: " + value));
      });
    });

    it("accepts positive and negative numbers including zero", function() {
      expect(check(-(10e10))).toBe(-(10e10));
      expect(check(-1)).toBe(-1);
      expect(check(0)).toBe(0);
      expect(check(1)).toBe(1);
      expect(check(10e10)).toBe(10e10);
    });

    it("rounds given value", function() {
      expect(check(-1.9)).toBe(-2);
      expect(check(-1.1)).toBe(-1);
      expect(check(-0.4)).toBe(0);
      expect(check(0.4)).toBe(0);
      expect(check(1.1)).toBe(1);
      expect(check(1.9)).toBe(2);
    });

  });

});
