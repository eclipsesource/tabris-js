describe("PropertyTypes:", function() {
  /*globals _:false*/

  describe("layoutData", function() {

    it("calls tabris.Layout.encodeLayoutData", function() {
      var inValue = {};
      var outValue = {};
      spyOn(tabris.Layout, "encodeLayoutData").and.returnValue(outValue);

      var result = tabris.PropertyTypes.layoutData.encode(inValue);

      expect(tabris.Layout.encodeLayoutData).toHaveBeenCalledWith(inValue);
      expect(result).toBe(outValue);
    });

  });

  describe("color", function() {

    it("encode translates initial to undefined", function() {
      var inValue = "initial";

      var result = tabris.PropertyTypes.color.encode(inValue);

      expect(result).toBe(undefined);
    });

  });

  describe("font", function() {

    it("encode translates initial to undefined", function() {
      var inValue = "initial";

      var result = tabris.PropertyTypes.font.encode(inValue);

      expect(result).toBe(undefined);
    });

  });

  describe("proxy", function() {

    var encode = tabris.PropertyTypes.proxy.encode;
    var decode = tabris.PropertyTypes.proxy.decode;

    it("translates widgets to ids in properties", function() {
      var value = new tabris.Proxy("other-id");

      expect(encode(value)).toBe("other-id");
    });

    it("translates widget collection to first ids in properties", function() {
      var value = new tabris.ProxyCollection([new tabris.Proxy("cid-23")]);

      expect(encode(value)).toBe("cid-23");
    });

    it("does not translate objects with id field to ids", function() {
      var value = {id: "23", name: "bar"};

      expect(encode(value)).toBe(value);
    });

    it("translates ids to widgets", function() {
      var value = new tabris.Proxy("cid-42");

      expect(decode("cid-42")).toBe(value);
    });

  });

  describe("image", function() {

    var check = tabris.PropertyTypes.image.encode;

    it("succeeds for minimal image value", function() {
      spyOn(console, "warn");

      var result = check({src: "foo.png"});

      expect(result).toEqual(["foo.png", null, null, null]);
      expect(console.warn).not.toHaveBeenCalled();
    });

    it("succeeds for image with width and height", function() {
      spyOn(console, "warn");

      var result = check({src: "foo.png", width: 10, height: 10});

      expect(result).toEqual(["foo.png", 10, 10, null]);
      expect(console.warn).not.toHaveBeenCalled();
    });

    it("succeeds for string", function() {
      expect(check("foo.jpg")).toEqual(["foo.jpg", null, null, null]);
    });

    it("succeeds for null", function() {
      expect(check(null)).toBeNull();
    });

    it("fails if image value is not an object", function() {
      expect(() => {
        check(23);
      }).toThrowError("Not an image: 23");
    });

    it("fails if src is undefined", function() {
      expect(() => {
        check({});
      }).toThrowError("image.src is not a string");
    });

    it("fails if src is empty string", function() {
      expect(() => {
        check({src: ""});
      }).toThrowError("image.src is an empty string");
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

      props.forEach((prop) => {
        goodValues.forEach((value) => {
          expect(() => { checkWith(prop, value); }).not.toThrow();
        });
        badValues.forEach((value) => {
          var error = new Error("image." + prop + " is not a dimension: " + value);
          expect(() => { checkWith(prop, value); }).toThrow(error);
        });
      });
    });

    it("warns if scale and width are given", function() {
      spyOn(console, "warn");

      check({src: "foo.png", width: 23, scale: 2});

      var warning = "Image scale is ignored if width or height are given";
      expect(console.warn).toHaveBeenCalledWith(warning);
    });

    it("warns if scale and height are given", function() {
      spyOn(console, "warn");

      check({src: "foo.png", height: 23, scale: 2});

      var warning = "Image scale is ignored if width or height are given";
      expect(console.warn).toHaveBeenCalledWith(warning);
    });

  });

  describe("boolean", function() {

    var check = tabris.PropertyTypes.boolean.encode;

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

    var check = tabris.PropertyTypes.string.encode;

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

  describe("number", function() {

    var check = tabris.PropertyTypes.number.encode;

    it("fails for non-numbers", function() {
      var values = ["", "foo", "23", null, undefined, true, false, {}, []];
      values.forEach((value) => {
        expect(() => {
          check(value);
        }).toThrowError(typeof value + " is not a number: " + value);
      });
    });

    it("fails for invalid numbers", function() {
      var values = [NaN, 1 / 0, -1 / 0];
      values.forEach((value) => {
        expect(() => {
          check(value);
        }).toThrowError("Number is not a valid value: " + value);
      });
    });

    it("accepts all valid kinds of numbers", function() {
      expect(check(0)).toBe(0);
      expect(check(1)).toBe(1);
      expect(check(-1)).toBe(-1);
      expect(check(10e10)).toBe(10e10);
      expect(check(10e-10)).toBe(10e-10);
    });

  });

  describe("natural", function() {

    var check = tabris.PropertyTypes.natural.encode;

    it("fails for non-numbers", function() {
      var values = ["", "foo", "23", null, undefined, true, false, {}, []];
      values.forEach((value) => {
        expect(() => {
          check(value);
        }).toThrowError(typeof value + " is not a number: " + value);
      });
    });

    it("fails for invalid numbers", function() {
      var values = [NaN, 1 / 0, -1 / 0];
      values.forEach((value) => {
        expect(() => {
          check(value);
        }).toThrowError("Number is not a valid value: " + value);
      });
    });

    it("accepts natural number including zero", function() {
      expect(check(0)).toBe(0);
      expect(check(1)).toBe(1);
      expect(check(10e10)).toBe(10e10);
    });

    it("normalizes negative values", function() {
      expect(check(-1)).toBe(0);
      expect(check(-1.5)).toBe(0);
    });

    it("rounds given value", function() {
      expect(check(0.4)).toBe(0);
      expect(check(1.1)).toBe(1);
      expect(check(1.9)).toBe(2);
    });

  });

  describe("integer", function() {

    var check = tabris.PropertyTypes.integer.encode;

    it("fails for non-numbers", function() {
      var values = ["", "foo", "23", null, undefined, true, false, {}, []];
      values.forEach((value) => {
        expect(() => {
          check(value);
        }).toThrowError(typeof value + " is not a number: " + value);
      });
    });

    it("fails for invalid numbers", function() {
      var values = [NaN, 1 / 0, -1 / 0];
      values.forEach((value) => {
        expect(() => {
          check(value);
        }).toThrowError("Number is not a valid value: " + value);
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

  describe("function", function() {

    var check = tabris.PropertyTypes.function.encode;

    it("accepts functions", function() {
      var fn = function() {};
      expect(check(fn)).toBe(fn);
    });

    it("fails for non-functions", function() {
      var values = ["", "foo", 23, null, undefined, true, false, {}, []];
      values.forEach((value) => {
        expect(() => {
          check(value);
        }).toThrowError(typeof value + " is not a function: " + value);
      });
    });

  });

  describe("choice", function() {

    var check = tabris.PropertyTypes.choice.encode;

    it("allows string values given in array", function() {
      var accepted = ["1", "foo", "bar"];

      expect(check("1", accepted)).toBe("1");
      expect(check("foo", accepted)).toBe("foo");
      expect(check("bar", accepted)).toBe("bar");
    });

    it("rejects string values not given in array", function() {
      var accepted = ["x", "y", "z"];

      ["1", "foo", "bar"].forEach((value) => {
        expect(() => {
          check(value, accepted);
        }).toThrowError("Accepting \"x\", \"y\", \"z\", given was: \"" + value + "\"");
      });
    });

  });

  describe("nullable", function() {

    var check = tabris.PropertyTypes.nullable.encode;

    it("allows null", function() {
      expect(check(null)).toBeNull();
    });

    it("allows null or alternate check", function() {
      expect(check(null, "natural")).toBeNull();
      expect(check(1.1, "natural")).toBe(1);
    });

    it("rejects alternate check", function() {
      expect(() => {
        check(NaN, "natural");
      }).toThrow();
    });

  });

  describe("opacity", function() {

    var check = tabris.PropertyTypes.opacity.encode;

    it("fails for non-numbers", function() {
      var values = ["", "foo", "23", null, undefined, true, false, {}, []];
      values.forEach((value) => {
        expect(() => {
          check(value);
        }).toThrowError(typeof value + " is not a number: " + value);
      });
    });

    it("fails for invalid numbers", function() {
      var values = [NaN, 1 / 0, -1 / 0];
      values.forEach((value) => {
        expect(() => {
          check(value);
        }).toThrowError("Number is not a valid value: " + value);
      });
    });

    it("fails for out-of-bounds numbers", function() {
      var values = [-0.1, -1, 1.01, 2];
      values.forEach((value) => {
        expect(() => {
          check(value);
        }).toThrowError("Number is out of bounds: " + value);
      });
    });

    it("accepts natural numbers between (including) zero and one", function() {
      expect(check(0)).toBe(0);
      expect(check(0.5)).toBe(0.5);
      expect(check(1)).toBe(1);
    });

  });

  describe("transform", function() {

    var check = tabris.PropertyTypes.transform.encode;
    var defaultValue = {
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      translationX: 0,
      translationY: 0,
      translationZ: 0
    };
    var customValue = {
      rotation: 1.2,
      scaleX: 2,
      scaleY: 0.5,
      translationX: -40,
      translationY: +40,
      translationZ: +20
    };

    it("accepts complete, valid values", function() {
      expect(check(defaultValue)).toEqual(defaultValue);
      expect(check(customValue)).toEqual(customValue);
    });

    it("auto-completes values", function() {
      var value = _.omit(customValue, ["scaleX", "translationY"]);
      var expected = {
        rotation: 1.2,
        scaleX: 1,
        scaleY: 0.5,
        translationX: -40,
        translationY: 0,
        translationZ: +20
      };
      expect(check(value)).toEqual(expected);
      expect(check({})).toEqual(defaultValue);
    });

    it("fails for invalid numbers", function() {
      [
        {rotation: null},
        {scaleX: undefined},
        {scaleY: NaN},
        {translationX: 1 / 0},
        {translationY: -1 / 0},
        {translationZ: 1 / 0}
      ].forEach((value) => {
        expect(() => {
          check(value);
        }).toThrow();
      });
    });

    it("fails for unknown keys", function() {
      expect(() => {
        check({foo: 1});
      }).toThrowError("Not a valid transformation containing \"foo\"");
    });

  });

  describe("array", function() {

    var check = tabris.PropertyTypes.array.encode;

    it("passes any array", function() {
      expect(check([1, "a", true])).toEqual([1, "a", true]);
    });

    it("converts null to empty array", function() {
      expect(check(null)).toEqual([]);
    });

    it("converts undefined to empty array", function() {
      expect(check(undefined)).toEqual([]);
    });

    it("does not copy array", function() {
      var input = [1, 2, 3];
      expect(check(input)).toBe(input);
    });

    it("fails for non-arrays", function() {
      var values = [0, 1, "", "foo", false, true, {}, {length: 0}];
      values.forEach((value) => {
        expect(() => {
          check(value);
        }).toThrowError(typeof value + " is not an array: " + value);
      });
    });

    it("performs optional item checks", function() {
      expect(check(["foo", 1, true], "string")).toEqual(["foo", "1", "true"]);
      expect(() => {
        check(["foo"], "integer");
      }).toThrowError("string is not a number: foo");
    });

  });

});
