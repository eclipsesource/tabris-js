describe("PropertyTypes:", function() {
  /*globals _:false*/

  describe("layoutData encode", function() {

    var encode = tabris.PropertyTypes.layoutData.encode;

    it("creates a safe copy", function() {
      var input = {top: 0, left: 0};
      var output = encode(input);

      expect(output).toEqual(input);
      expect(output).not.toBe(input);
    });

    it("skips null entries", function() {
      var input = {top: 0, bottom: null, width: 0, height: null, centerX: 0, centerY: null};
      var output = encode(input);

      expect(output).toEqual({top: 0, width: 0, centerX: 0});
    });

    it("skips undefined entries", function() {
      var input = {
        top: 0,
        bottom: undefined,
        width: 0,
        height: undefined,
        centerX: 0,
        centerY: undefined
      };
      var output = encode(input);

      expect(output).toEqual({top: 0, width: 0, centerX: 0});
    });

    it("creates a safe copy of arrays", function() {
      var input = {left: [30, 10], top: [70, 20]};
      var output = encode(input);

      expect(output.left).toEqual(input.left);
      expect(output.left).not.toBe(input.left);
    });

    ["width", "height", "centerX", "centerY"].forEach((attr) => {

      it("fails if '" + attr + "' is not a number", function() {
        expect(() => {
          var layoutData = {};
          layoutData[attr] = "23";
          encode(layoutData);
        }).toThrowError("Invalid value for '" + attr + "': must be a number");
      });

    });

    ["left", "right", "top", "bottom"].forEach((attr) => {

      it("fails if '" + attr + "' is an object", function() {
        expect(() => {
          var layoutData = {};
          layoutData[attr] = {};
          encode(layoutData);
        }).toThrowError("Invalid value for '" + attr + "': invalid type");
      });

      it("fails if '" + attr + "' is an invalid array", function() {
        expect(() => {
          var layoutData = {};
          layoutData[attr] = [23];
          encode(layoutData);
        }).toThrowError("Invalid value for '" + attr + "': list length must be 2");
      });

    });

    it("fails if 'baseline' is a number", function() {
      expect(() => {
        encode({left: 0, baseline: 23});
      }).toThrowError("Invalid value for 'baseline': must be a widget reference");
    });

    it("fails if 'baseline' is a percentage", function() {
      expect(() => {
        encode({left: 0, baseline: "23%"});
      }).toThrowError("Invalid value for 'baseline': must be a widget reference");
    });

    it("fails for unknown attribute", function() {
      expect(() => {
        encode({left: 0, foo: "23"});
      }).toThrowError("Invalid key 'foo' in layoutData");
    });

    it("translates percentage strings to arrays", function() {
      expect(encode({left: "30%", top: "0%"})).toEqual({left: [30, 0], top: 0});
    });

    it("translates percentages in arrays to numbers", function() {
      var input = {left: ["30%", 0]};
      var output = encode(input);

      expect(output.left).toEqual([30, 0]);
    });

    it("translates selector to array", function() {
      var input = {left: "#other", top: "#other"};
      var expected = {left: ["#other", 0], top: ["#other", 0]};

      expect(encode(input)).toEqual(expected);
    });

    it("translates zero percentage to offset", function() {
      expect(encode({left: "0%", top: ["0%", 23]}))
        .toEqual({left: 0, top: 23});
    });

    it("translates `percentage offset` strings to arrays", function() {
      var input = {left: "30%   5", top: "1% -7", bottom: "-5% +9", right: "100% -10.4"};
      var expected = {left: [30, 5], top: [1, -7], bottom: [-5, 9], right: [100, -10.4]};

      expect(encode(input)).toEqual(expected);
    });

    it("translates `selector offset` strings to arrays", function() {
      var input = {left: "#foo   5", top: "#bar -7", bottom: "#boo +9", right: "#far -10.4"};
      var expected = {left: ["#foo", 5], top: ["#bar", -7], bottom: ["#boo", 9], right: ["#far", -10.4]};

      expect(encode(input)).toEqual(expected);
    });

    it("does not encode widget refs", function() {
      var input = {left: ["#other", 0]};
      var output = encode(input);

      expect(output.left).toEqual(["#other", 0]);
    });

  });

  describe("layoutData decode", function() {

    var decode = tabris.PropertyTypes.layoutData.decode;

    it("creates a safe copy", function() {
      var input = {top: 0, left: 0};
      var output = decode(input);

      expect(output).toEqual(input);
      expect(output).not.toBe(input);
    });

    it("creates a safe copy of arrays", function() {
      var input = {left: ["30%", 10]};
      var output = decode(input);

      expect(output.left).toEqual(input.left);
      expect(output.left).not.toBe(input.left);
    });

    it("translates to percentage strings", function() {
      expect(decode({left: [30, 10]})).toEqual({left: ["30%", 10]});
    });

    it("translates arrays with zero percentage to offset", function() {
      expect(decode({left: [0, 23]})).toEqual({left: 23});
    });

    it("translates arrays with zero offset to scalars", function() {
      expect(decode({left: [23, 0], top: ["#other", 0]})).toEqual({left: "23%", top: "#other"});
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

    var encode = tabris.PropertyTypes.image.encode;

    it("succeeds for minimal image value", function() {
      spyOn(console, "warn");

      var result = encode({src: "foo.png"});

      expect(result).toEqual(["foo.png", null, null, null]);
      expect(console.warn).not.toHaveBeenCalled();
    });

    it("succeeds for image with width and height", function() {
      spyOn(console, "warn");

      var result = encode({src: "foo.png", width: 10, height: 10});

      expect(result).toEqual(["foo.png", 10, 10, null]);
      expect(console.warn).not.toHaveBeenCalled();
    });

    it("succeeds for string", function() {
      expect(encode("foo.jpg")).toEqual(["foo.jpg", null, null, null]);
    });

    it("succeeds for null", function() {
      expect(encode(null)).toBeNull();
    });

    it("fails if image value is not an object", function() {
      expect(() => {
        encode(23);
      }).toThrowError("Not an image: 23");
    });

    it("fails if src is undefined", function() {
      expect(() => {
        encode({});
      }).toThrowError("image.src is not a string");
    });

    it("fails if src is empty string", function() {
      expect(() => {
        encode({src: ""});
      }).toThrowError("image.src is an empty string");
    });

    it("fails if width/height/scale values are invalid number", function() {
      var goodValues = [0, 1, 1 / 3, 0.5, Math.PI];
      var badValues = [-1, NaN, 1 / 0, -1 / 0, "1", true, false, {}];
      var props = ["width", "height", "scale"];
      var checkWith = function(prop, value) {
        var image = {src: "foo"};
        image[prop] = value;
        encode(image);
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

      encode({src: "foo.png", width: 23, scale: 2});

      var warning = "Image scale is ignored if width or height are given";
      expect(console.warn).toHaveBeenCalledWith(warning);
    });

    it("warns if scale and height are given", function() {
      spyOn(console, "warn");

      encode({src: "foo.png", height: 23, scale: 2});

      var warning = "Image scale is ignored if width or height are given";
      expect(console.warn).toHaveBeenCalledWith(warning);
    });

  });

  describe("boolean", function() {

    var encode = tabris.PropertyTypes.boolean.encode;

    it("passes through true", function() {
      expect(encode(true)).toBe(true);
    });

    it("passes through false", function() {
      expect(encode(false)).toBe(false);
    });

    it("translates falsy values", function() {
      expect(encode(null)).toBe(false);
      expect(encode("")).toBe(false);
      expect(encode(undefined)).toBe(false);
      expect(encode(0)).toBe(false);
    });

    it("translates truthy values", function() {
      expect(encode(1)).toBe(true);
      expect(encode({})).toBe(true);
      expect(encode("true")).toBe(true);
      expect(encode("false")).toBe(true);
    });

  });

  describe("string", function() {

    var encode = tabris.PropertyTypes.string.encode;

    it("translates any value to string", function() {
      expect(encode("str")).toBe("str");
      expect(encode(23)).toBe("23");
      expect(encode(false)).toBe("false");
      expect(encode(null)).toBe("null");
      expect(encode(undefined)).toBe("undefined");
      expect(encode({})).toBe("[object Object]");
      expect(encode([1, 2, 3])).toBe("1,2,3");
      expect(encode({toString: function() {return "foo";}})).toBe("foo");
    });

  });

  describe("number", function() {

    var encode = tabris.PropertyTypes.number.encode;

    it("fails for non-numbers", function() {
      var values = ["", "foo", "23f", null, undefined, true, false, {}, []];
      values.forEach((value) => {
        expect(() => {
          encode(value);
        }).toThrowError(typeof value + " is not a number: " + value);
      });
    });

    it("fails for invalid numbers", function() {
      var values = [NaN, 1 / 0, -1 / 0];
      values.forEach((value) => {
        expect(() => {
          encode(value);
        }).toThrowError("Invalid number: " + value);
      });
    });

    it("accepts all valid kinds of numbers", function() {
      expect(encode(0)).toBe(0);
      expect(encode(1)).toBe(1);
      expect(encode(-1)).toBe(-1);
      expect(encode(10e10)).toBe(10e10);
      expect(encode(10e-10)).toBe(10e-10);
    });

    it("accepts strings", function() {
      expect(encode("0")).toBe(0);
      expect(encode("1")).toBe(1);
      expect(encode("-1")).toBe(-1);
      expect(encode("3.14")).toBe(3.14);
      expect(encode("-3.14")).toBe(-3.14);
      expect(encode(".01")).toBe(0.01);
    });

  });

  describe("natural", function() {

    var encode = tabris.PropertyTypes.natural.encode;

    it("fails for non-numbers", function() {
      var values = ["", "foo", "23f", null, undefined, true, false, {}, []];
      values.forEach((value) => {
        expect(() => {
          encode(value);
        }).toThrowError(typeof value + " is not a number: " + value);
      });
    });

    it("fails for invalid numbers", function() {
      var values = [NaN, 1 / 0, -1 / 0];
      values.forEach((value) => {
        expect(() => {
          encode(value);
        }).toThrowError("Invalid number: " + value);
      });
    });

    it("accepts natural number including zero", function() {
      expect(encode(0)).toBe(0);
      expect(encode(1)).toBe(1);
      expect(encode(10e10)).toBe(10e10);
    });

    it("normalizes negative values", function() {
      expect(encode(-1)).toBe(0);
      expect(encode(-1.5)).toBe(0);
    });

    it("rounds given value", function() {
      expect(encode(0.4)).toBe(0);
      expect(encode(1.1)).toBe(1);
      expect(encode(1.9)).toBe(2);
    });

    it("accepts strings", function() {
      expect(encode("0")).toBe(0);
      expect(encode("1")).toBe(1);
      expect(encode("-1")).toBe(0);
      expect(encode("0.7")).toBe(1);
    });

  });

  describe("integer", function() {

    var encode = tabris.PropertyTypes.integer.encode;

    it("fails for non-numbers", function() {
      var values = ["", "foo", "23f", null, undefined, true, false, {}, []];
      values.forEach((value) => {
        expect(() => {
          encode(value);
        }).toThrowError(typeof value + " is not a number: " + value);
      });
    });

    it("fails for invalid numbers", function() {
      var values = [NaN, 1 / 0, -1 / 0];
      values.forEach((value) => {
        expect(() => {
          encode(value);
        }).toThrowError("Invalid number: " + value);
      });
    });

    it("accepts positive and negative numbers including zero", function() {
      expect(encode(-(10e10))).toBe(-(10e10));
      expect(encode(-1)).toBe(-1);
      expect(encode(0)).toBe(0);
      expect(encode(1)).toBe(1);
      expect(encode(10e10)).toBe(10e10);
    });

    it("rounds given value", function() {
      expect(encode(-1.9)).toBe(-2);
      expect(encode(-1.1)).toBe(-1);
      expect(encode(-0.4)).toBe(0);
      expect(encode(0.4)).toBe(0);
      expect(encode(1.1)).toBe(1);
      expect(encode(1.9)).toBe(2);
    });

    it("accepts strings", function() {
      expect(encode("0")).toBe(0);
      expect(encode("1")).toBe(1);
      expect(encode("-1")).toBe(-1);
      expect(encode("0.7")).toBe(1);
    });

  });

  describe("function", function() {

    var encode = tabris.PropertyTypes.function.encode;

    it("accepts functions", function() {
      var fn = function() {};
      expect(encode(fn)).toBe(fn);
    });

    it("fails for non-functions", function() {
      var values = ["", "foo", 23, null, undefined, true, false, {}, []];
      values.forEach((value) => {
        expect(() => {
          encode(value);
        }).toThrowError(typeof value + " is not a function: " + value);
      });
    });

  });

  describe("choice", function() {

    var encode = tabris.PropertyTypes.choice.encode;

    it("allows string values given in array", function() {
      var accepted = ["1", "foo", "bar"];

      expect(encode("1", accepted)).toBe("1");
      expect(encode("foo", accepted)).toBe("foo");
      expect(encode("bar", accepted)).toBe("bar");
    });

    it("rejects string values not given in array", function() {
      var accepted = ["x", "y", "z"];

      ["1", "foo", "bar"].forEach((value) => {
        expect(() => {
          encode(value, accepted);
        }).toThrowError("Accepting \"x\", \"y\", \"z\", given was: \"" + value + "\"");
      });
    });

  });

  describe("nullable", function() {

    var encode = tabris.PropertyTypes.nullable.encode;

    it("allows null", function() {
      expect(encode(null)).toBeNull();
    });

    it("allows null or alternate check", function() {
      expect(encode(null, "natural")).toBeNull();
      expect(encode(1.1, "natural")).toBe(1);
    });

    it("rejects alternate check", function() {
      expect(() => {
        encode(NaN, "natural");
      }).toThrow();
    });

  });

  describe("opacity", function() {

    var encode = tabris.PropertyTypes.opacity.encode;

    it("fails for non-numbers", function() {
      var values = ["", "foo", "23f", null, undefined, true, false, {}, []];
      values.forEach((value) => {
        expect(() => {
          encode(value);
        }).toThrowError(typeof value + " is not a number: " + value);
      });
    });

    it("fails for invalid numbers", function() {
      var values = [NaN, 1 / 0, -1 / 0];
      values.forEach((value) => {
        expect(() => {
          encode(value);
        }).toThrowError("Invalid number: " + value);
      });
    });

    it("fails for out-of-bounds numbers", function() {
      var values = [-0.1, -1, 1.01, 2];
      values.forEach((value) => {
        expect(() => {
          encode(value);
        }).toThrowError("Number is out of bounds: " + value);
      });
    });

    it("accepts strings", function() {
      expect(encode("0")).toBe(0);
      expect(encode("0.1")).toBe(0.1);
      expect(encode("1")).toBe(1);
    });

    it("accepts natural numbers between (including) zero and one", function() {
      expect(encode(0)).toBe(0);
      expect(encode(0.5)).toBe(0.5);
      expect(encode(1)).toBe(1);
    });

  });

  describe("transform", function() {

    var encode = tabris.PropertyTypes.transform.encode;
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
      expect(encode(defaultValue)).toEqual(defaultValue);
      expect(encode(customValue)).toEqual(customValue);
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
      expect(encode(value)).toEqual(expected);
      expect(encode({})).toEqual(defaultValue);
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
          encode(value);
        }).toThrow();
      });
    });

    it("fails for unknown keys", function() {
      expect(() => {
        encode({foo: 1});
      }).toThrowError("Not a valid transformation containing \"foo\"");
    });

  });

  describe("array", function() {

    var encode = tabris.PropertyTypes.array.encode;

    it("passes any array", function() {
      expect(encode([1, "a", true])).toEqual([1, "a", true]);
    });

    it("converts null to empty array", function() {
      expect(encode(null)).toEqual([]);
    });

    it("converts undefined to empty array", function() {
      expect(encode(undefined)).toEqual([]);
    });

    it("does not copy array", function() {
      var input = [1, 2, 3];
      expect(encode(input)).toBe(input);
    });

    it("fails for non-arrays", function() {
      var values = [0, 1, "", "foo", false, true, {}, {length: 0}];
      values.forEach((value) => {
        expect(() => {
          encode(value);
        }).toThrowError(typeof value + " is not an array: " + value);
      });
    });

    it("performs optional item checks", function() {
      expect(encode(["foo", 1, true], "string")).toEqual(["foo", "1", "true"]);
      expect(() => {
        encode(["foo"], "integer");
      }).toThrowError("string is not a number: foo");
    });

  });

});
