describe("util-fonts", function() {

  describe("fontStringToArray", function() {

    var parse = function(str) {
      return util.fontStringToArray(str);
    };

    var parsing = function(str) {
      return function() {
        return util.fontStringToArray(str);
      };
    };

    it("parses valid sizes", function() {
      expect(parse("12px")[1]).toBe(12);
      expect(parse("12px 20px")[1]).toBe(12);
      expect(parse("8px ")[1]).toBe(8);
      expect(parse(" 18px")[1]).toBe(18);
      expect(parse("  50px  ")[1]).toBe(50);
      expect(parse("12px")[1]).toBe(12);
      expect(parse("italic 12px")[1]).toBe(12);
      expect(parse("bold italic 12px")[1]).toBe(12);
      expect(parse("12px Arial, Fantasy")[1]).toBe(12);
      expect(parse("12px 'Times New Roman', Arial")[1]).toBe(12);
      expect(parse("12px \"Times New Roman\", Arial")[1]).toBe(12);
    });

    it("throws error for strings without valid size", function() {
      expect(parsing("12pxf")).toThrow();
      expect(parsing("12p x")).toThrow();
      expect(parsing("-1px")).toThrow();
      expect(parsing("foo13px")).toThrow();
      expect(parsing("8 px ")).toThrow();
      expect(parsing(" 18pt")).toThrow();
      expect(parsing("  px  ")).toThrow();
      expect(parsing("23")).toThrow();
    });

    it("parses valid styles", function() {
      expect(parse("italic 12px")[3]).toBe(true);
      expect(parse("bold italic 12px")[3]).toBe(true);
      expect(parse("italic bold 12px")[3]).toBe(true);
      expect(parse("italic bold 12px Arial, Times")[3]).toBe(true);
      expect(parse("normal normal 12px")[3]).toBe(false);
      expect(parse("bold normal 12px")[3]).toBe(false);
      expect(parse("normal 12px")[3]).toBe(false);
      expect(parse("12px")[3]).toBe(false);
      expect(parse("12px italic")[3]).toBe(false);
    });

    it("parses valid weight", function() {
      expect(parse("bold 12px")[2]).toBe(true);
      expect(parse("bold   italic 12px")[2]).toBe(true);
      expect(parse("  italic bold 12px")[2]).toBe(true);
      expect(parse(" italic  bold 12px Arial, Times")[2]).toBe(true);
      expect(parse("normal normal 12px")[2]).toBe(false);
      expect(parse("italic normal 12px")[2]).toBe(false);
      expect(parse("normal 12px")[2]).toBe(false);
      expect(parse("12px")[2]).toBe(false);
      expect(parse("12px bold")[2]).toBe(false);
    });

    it("throws error for strings with invalid styles", function() {
      expect(parsing("bold-italic 12px")).toThrow();
      expect(parsing("bold.italic 12px")).toThrow();
      expect(parsing("bold bold 12px")).toThrow();
      expect(parsing("italic italic 12px")).toThrow();
      expect(parsing("bold italic normal 12px")).toThrow();
      expect(parsing("normal normal  normal 12px")).toThrow();
      expect(parsing("bold0italic 12px")).toThrow();
      expect(parsing("foobar 12px")).toThrow();
      expect(parsing("12px foobar")).not.toThrow();
    });

    it("parses valid font families", function() {
      expect(parse("12px  ")[0]).toEqual([""]);
      expect(parse("12px Arial")[0]).toEqual(["Arial"]);
      expect(parse("bold italic 12px Arial")[0]).toEqual(["Arial"]);
      expect(parse("12px Arial, Fantasy")[0]).toEqual(["Arial", "Fantasy"]);
      expect(parse("12px Times New Roman,Fantasy")[0]).toEqual(["Times New Roman", "Fantasy"]);
      expect(parse("12px   Arial ,   Fantasy")[0]).toEqual(["Arial", "Fantasy"]);
      expect(parse("12px bold italic")[0]).toEqual(["bold italic"]);
      expect(parse("12px Arial, Times New Roman ,Fantasy")[0])
          .toEqual(["Arial", "Times New Roman", "Fantasy"]);
      expect(parse("12px ' Arial ', \"Times New Roman\",Fantasy")[0])
          .toEqual(["Arial", "Times New Roman", "Fantasy"]);
    });

    it("throws error for strings with invalid family syntax", function() {
      expect(parsing("12px Arial \"Times New Roman\", Fantasy")).toThrow();
      expect(parsing("12px Arial \"Times New Roman\", Fantasy,")).toThrow();
      expect(parsing("12px'Arial', \"Times New Roman\", Fantasy")).toThrow();
      expect(parsing("12px Arial, \"Times New Roman', Fantasy")).toThrow();
      expect(parsing("12px Arial, foo \"Times New Roman\", Fantasy")).toThrow();
      expect(parsing("12px Arial, \"Times New Roman\" bar, Fantasy")).toThrow();
      expect(parsing("12px Ar'ial, \"Times New Roman\", Fantasy")).toThrow();
      expect(parsing("12px Arial, Times New Roman\", Fantasy")).toThrow();
      expect(parsing("12px Arial, \"Times New Roman, Fantasy")).toThrow();
      expect(parsing("12px Arial,, Fantasy")).toThrow();
    });

  });

  describe("fontArrayToString", function() {

    var decode = function(arr) {
      return util.fontArrayToString(arr);
    };

    it("creates string from array", function() {
      expect(decode([["Arial"], 12, false, false])).toBe("12px Arial");
      expect(decode([["Arial", "Times New Roman"], 12, false, false]))
          .toBe("12px Arial, Times New Roman");
      expect(decode([[""], 12, false, false])).toBe("12px");
      expect(decode([[""], 12, true, false])).toBe("bold 12px");
      expect(decode([[""], 12, false, true])).toBe("italic 12px");
      expect(decode([[""], 12, true, true])).toBe("italic bold 12px");
      expect(decode([["Arial"], 12, true, true])).toBe("italic bold 12px Arial");
    });

  });

});
