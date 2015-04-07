describe("Layout:", function() {

  var consoleBackup = window.console;

  beforeEach(function() {
    window.console = jasmine.createSpyObj("console", ["log", "info", "warn", "error"]);
  });

  afterEach(function() {
    window.console = consoleBackup;
  });

  describe("checkLayoutData", function() {

    var check = tabris.Layout.checkLayoutData;

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

  describe("encodeLayoutData", function() {

    var encode = tabris.Layout.encodeLayoutData;
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
      expect(encode({left: 23, centerY: other, right: [other, 42]}, widget))
        .toEqual({left: 23, centerY: other.cid, right: [other.cid, 42]});
    });

    it("translates selector in array to id", function() {
      expect(encode({left: 23, centerY: "#other", right: ["#other", 42]}, widget))
        .toEqual({left: 23, centerY: other.cid, right: [other.cid, 42]});
    });

    it("translates selector outside array to id array (offsets)", function() {
      expect(encode({left: "#other", right: "#other", top: "#other", bottom: "#other"}, widget))
        .toEqual({left: [other.cid, 0], right: [other.cid, 0], top: [other.cid, 0], bottom: [other.cid, 0]});
    });

    it("translates selector outside array to id (centerX/Y, baseline)", function() {
      expect(encode({centerX: "#other", baseline: "#other"}, widget))
        .toEqual({centerX: other.cid, baseline: other.cid});
    });

    it("translates percentage string in array to number", function() {
      expect(encode({left: 23, right: ["12%", 34], top: ["0%", 42]}, widget))
        .toEqual({left: 23, right: [12, 34], top: [0, 42]});
    });

    it("translates percentage string outside array to number array", function() {
      expect(encode({left: 23, right: "12%", top: "0%"}, widget))
        .toEqual({left: 23, right: [12, 0], top: [0, 0]});
    });

    it("treats ambiguous string as selector", function() {
      tabris.registerWidget("Foo%", {});
      var freak1 = tabris.create("Foo%").appendTo(parent);
      var freak2 = tabris.create("TestType", {id: "23%"}).appendTo(parent);

      expect(encode({left: 23, right: "#23%", top: ["Foo%", 42]}, widget))
        .toEqual({left: 23, right: [freak2.cid, 0], top: [freak1.cid, 42]});
    });

    it("translation does not modify layoutData", function() {
      var layoutData = {left: 23, right: other, top: [other, 42]};

      encode(layoutData, widget);

      expect(layoutData.top).toEqual([other, 42]);
    });

    it("throws if selector does not resolve due to missing sibling", function() {
      other.dispose();

      expect(function() {
        encode({left: 23, right: "#other", top: ["#other", 42]}, widget);
      }).toThrow();
    });

    it("throws if selector does not resolve due to missing parent", function() {
      widget = tabris.create("TestType");

      expect(function() {
        encode({left: 23, right: "#other", top: ["#other", 42]}, widget);
      }).toThrow();
    });

    it("replaces selector not resolved due to missing sibling with 0", function() {
      other.dispose();

      expect(encode({left: 23, right: "#noone", top: ["#noone", 42]}, widget, true))
        .toEqual({left: 23, right: [0, 0], top: [0, 42]});
    });

    it("replaces selector not resolved due to missing parent with 0", function() {
      widget = tabris.create("TestType");

      expect(encode({left: 23, right: "#noone", top: ["#noone", 42]}, widget, true))
        .toEqual({left: 23, right: [0, 0], top: [0, 42]});
    });

  });

});
