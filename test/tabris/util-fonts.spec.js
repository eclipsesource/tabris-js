describe("_-fonts", function() {

  describe("fontStringToObject", function() {

    var parse = function(str) {
      return _.fontStringToObject(str);
    };

    var parsing = function(str) {
      return function() {
        return _.fontStringToObject(str);
      };
    };

    it("parses valid sizes", function() {
      expect(parse("12px").size).toBe(12);
      expect(parse("12px 20px").size).toBe(12);
      expect(parse("8px ").size).toBe(8);
      expect(parse(" 18px").size).toBe(18);
      expect(parse("  50px  ").size).toBe(50);
      expect(parse("12px").size).toBe(12);
      expect(parse("italic 12px").size).toBe(12);
      expect(parse("bold italic 12px").size).toBe(12);
      expect(parse("12px Arial, Fantasy").size).toBe(12);
      expect(parse("12px 'Times New Roman', Arial").size).toBe(12);
      expect(parse("12px \"Times New Roman\", Arial").size).toBe(12);
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
      expect(parse("italic 12px").style).toBe("italic");
      expect(parse("bold italic 12px").style).toBe("italic");
      expect(parse("italic bold 12px").style).toBe("italic");
      expect(parse("italic bold 12px Arial, Times").style).toBe("italic");
      expect(parse("normal normal 12px").style).toBe("normal");
      expect(parse("bold normal 12px").style).toBe("normal");
      expect(parse("normal 12px").style).toBe("normal");
      expect(parse("12px").style).toBe("normal");
      expect(parse("12px italic").style).toBe("normal");
    });

    it("parses valid weight", function() {
      expect(parse("bold 12px").weight).toBe("bold");
      expect(parse("black 12px").weight).toBe("black");
      expect(parse("light   italic 12px").weight).toBe("light");
      expect(parse("  italic thin 12px").weight).toBe("thin");
      expect(parse(" italic  medium 12px Arial, Times").weight).toBe("medium");
      expect(parse("normal normal 12px").weight).toBe("normal");
      expect(parse("italic normal 12px").weight).toBe("normal");
      expect(parse("normal 12px").weight).toBe("normal");
      expect(parse("12px").weight).toBe("normal");
      expect(parse("12px bold").weight).toBe("normal");
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
      expect(parse("12px  ").family).toEqual([""]);
      expect(parse("12px Arial").family).toEqual(["Arial"]);
      expect(parse("bold italic 12px Arial").family).toEqual(["Arial"]);
      expect(parse("12px Arial, Fantasy").family).toEqual(["Arial", "Fantasy"]);
      expect(parse("12px Times New Roman,Fantasy").family).toEqual(["Times New Roman", "Fantasy"]);
      expect(parse("12px   Arial ,   Fantasy").family).toEqual(["Arial", "Fantasy"]);
      expect(parse("12px bold italic").family).toEqual(["bold italic"]);
      expect(parse("12px Arial, Times New Roman ,Fantasy").family)
          .toEqual(["Arial", "Times New Roman", "Fantasy"]);
      expect(parse("12px ' Arial ', \"Times New Roman\",Fantasy").family)
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

  describe("fontObjectToString", function() {

    var decode = function(arr) {
      return _.fontObjectToString(arr);
    };

    it("creates string from object", function() {
      expect(decode({family: ["Arial"], size: 12, weight: "normal", style: "normal"}))
        .toBe("normal normal 12px Arial");
      expect(decode({
        family: ["Arial", "Times New Roman"],
        size: 12,
        weight: "normal",
        style: "normal"
      })).toBe("normal normal 12px Arial, Times New Roman");
      expect(decode({family: [""], size: 12, weight: "normal", style: "normal"}))
        .toBe("normal normal 12px");
      expect(decode({family: [""], size: 12, weight: "bold", style: "normal"}))
        .toBe("normal bold 12px");
      expect(decode({family: [""], size: 12, weight: "normal", style: "italic"}))
        .toBe("italic normal 12px");
      expect(decode({family: [""], size: 12, weight: "thin", style: "italic"}))
        .toBe("italic thin 12px");
      expect(decode({family: ["Arial"], size: 12, weight: "medium", style: "italic"}))
        .toBe("italic medium 12px Arial");
    });

  });

});
