describe("Layout:", function() {

  describe("encodeLayoutData", function() {

    var encode = tabris.Layout.encodeLayoutData;

    it("creates a safe copy", function() {
      var input = {top: 0, left: 0};
      var output = encode(input);

      expect(output).toEqual(input);
      expect(output).not.toBe(input);
    });

    it("creates a safe copy of arrays", function() {
      var input = {left: [30, 10], top: [70, 20]};
      var output = encode(input);

      expect(output.left).toEqual(input.left);
      expect(output.left).not.toBe(input.left);
    });

    it("raises a warning for inconsistent layoutData (centerX)", function() {
      spyOn(console, "warn");

      encode({top: 0, left: 0, centerX: 0});

      var warning = "Inconsistent layoutData: centerX overrides left and right";
      expect(console.warn).toHaveBeenCalledWith(warning);
    });

    it("skips overridden properties from layoutData (centerX)", function() {
      var result = encode({top: 1, left: 2, right: 3, centerX: 4});

      expect(result).toEqual({top: 1, centerX: 4});
    });

    it("raises a warning for inconsistent layoutData (centerY)", function() {
      spyOn(console, "warn");

      encode({left: 0, top: 0, centerY: 0});

      var warning = "Inconsistent layoutData: centerY overrides top and bottom";
      expect(console.warn).toHaveBeenCalledWith(warning);
    });

    it("skips overridden properties from layoutData (centerY)", function() {
      var result = encode({left: 1, top: 2, bottom: 3, centerY: 4});

      expect(result).toEqual({left: 1, centerY: 4});
    });

    it("raises a warning for inconsistent layoutData (baseline)", function() {
      spyOn(console, "warn");

      encode({left: 0, top: 0, baseline: "#other"});

      var warning = "Inconsistent layoutData: baseline overrides top, bottom, and centerY";
      expect(console.warn).toHaveBeenCalledWith(warning);
    });

    it("skips overridden properties from layoutData (baseline)", function() {
      var result = encode({left: 1, top: 2, bottom: 3, centerY: 4, baseline: "other"});

      expect(result).toEqual({left: 1, baseline: "other"});
    });

    ["width", "height", "centerX", "centerY"].forEach(function(attr) {

      it("fails if '" + attr + "' is not a number", function() {
        expect(function() {
          var layoutData = {};
          layoutData[attr] = "23";
          encode(layoutData);
        }).toThrowError("Invalid value for '" + attr + "': must be a number");
      });

    });

    ["left", "right", "top", "bottom"].forEach(function(attr) {

      it("fails if '" + attr + "' is an object", function() {
        expect(function() {
          var layoutData = {};
          layoutData[attr] = {};
          encode(layoutData);
        }).toThrowError("Invalid value for '" + attr + "': invalid type");
      });

      it("fails if '" + attr + "' is an invalid array", function() {
        expect(function() {
          var layoutData = {};
          layoutData[attr] = [23];
          encode(layoutData);
        }).toThrowError("Invalid value for '" + attr + "': array length must be 2");
      });

    });

    it("fails if 'baseline' is a number", function() {
      expect(function() {
        encode({left: 0, baseline: 23});
      }).toThrowError("Invalid value for 'baseline': must be a widget reference");
    });

    it("fails if 'baseline' is a percentage", function() {
      expect(function() {
        encode({left: 0, baseline: "23%"});
      }).toThrowError("Invalid value for 'baseline': must be a widget reference");
    });

    it("fails for unknown attribute", function() {
      expect(function() {
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

    it("does not encode widget refs", function() {
      var input = {left: ["#other", 0]};
      var output = encode(input);

      expect(output.left).toEqual(["#other", 0]);
    });

  });

  describe("decodeLayoutData", function() {

    var decode = tabris.Layout.decodeLayoutData;

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

  describe("resolveReferences", function() {

    var resolve = tabris.Layout.resolveReferences;
    var parent, widget, other;

    beforeEach(function() {
      tabris._reset();
      tabris._init(new NativeBridgeSpy());
      tabris.registerWidget("TestType", {});
      parent = tabris.create("Composite");
      widget = tabris.create("TestType").appendTo(parent);
      other = tabris.create("TestType", {id: "other"}).appendTo(parent);
    });

    afterEach(function() {
      delete tabris.TestType;
    });

    it("translates widget to ids", function() {
      var input = {centerY: other, left: [other, 42]};
      var expected = {centerY: other.cid, left: [other.cid, 42]};

      expect(resolve(input, widget)).toEqual(expected);
    });

    it("translates selectors to ids", function() {
      var input = {baseline: "#other", left: ["#other", 42]};
      var expected = {baseline: other.cid, left: [other.cid, 42]};

      expect(resolve(input, widget)).toEqual(expected);
    });

    it("does not modify numbers", function() {
      var input = {centerX: 23, left: [30, 42]};
      var expected = {centerX: 23, left: [30, 42]};

      expect(resolve(input, widget)).toEqual(expected);
    });

    it("treats ambiguous string as selector", function() {
      tabris.registerWidget("Foo%", {});
      var freak1 = tabris.create("Foo%").appendTo(parent);
      var freak2 = tabris.create("TestType", {id: "23%"}).appendTo(parent);

      expect(resolve({left: ["Foo%", 23], top: ["#23%", 42]}, widget))
        .toEqual({left: [freak1.cid, 23], top: [freak2.cid, 42]});
    });

    it("throws if selector does not resolve due to missing sibling", function() {
      other.dispose();

      expect(function() {
        resolve({left: 23, right: "#other", top: ["#other", 42]}, widget);
      }).toThrow();
    });

    it("throws if selector does not resolve due to missing parent", function() {
      widget = tabris.create("TestType");

      expect(function() {
        resolve({left: 23, right: "#other", top: ["#other", 42]}, widget);
      }).toThrow();
    });

    it("replaces unresolved selector (due to missing sibling) with 0", function() {
      other.dispose();

      expect(resolve({baseline: "#noone", left: ["#noone", 42]}, widget, true))
        .toEqual({baseline: 0, left: [0, 42]});
    });

    it("replaces unresolved selector (due to missing parent) with 0", function() {
      widget = tabris.create("TestType");

      expect(resolve({baseline: "#noone", left: ["#noone", 42]}, widget, true))
        .toEqual({baseline: 0, left: [0, 42]});
    });

  });

});
