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
      tabris.registerWidget("TestType", {});
      parent = tabris.create("Composite");
      widget = tabris.create("TestType").appendTo(parent);
      other = tabris.create("TestType", {id: "other"}).appendTo(parent);
    });

    afterEach(function() {
      delete tabris.TestType;
    });

    it("translates widgets to ids", function() {
      expect(encode({left: 23, right: other, top: [other, 42]}, widget))
        .toEqual({left: 23, right: other.cid, top: [other.cid, 42]});
    });

    it("translates selector to ids", function() {
      expect(encode({left: 23, right: "#other", top: ["#other", 42]}, widget))
        .toEqual({left: 23, right: other.cid, top: [other.cid, 42]});
    });

    it("translation does not modify layoutData", function() {
      var layoutData = {left: 23, right: other, top: [other, 42]};

      encode(layoutData, widget);

      expect(layoutData.top).toEqual([other, 42]);
    });

    it("throws if selector does not resolve", function() {
      other.dispose();

      expect(function() {
        encode({left: 23, right: "#other", top: ["#other", 42]}, widget);
      }).toThrow();
    });

    it("replaces unresolved selector to 0 if forced", function() {
      other.dispose();

      expect(encode({left: 23, right: "#other", top: ["#other", 42]}, widget, true))
        .toEqual({left: 23, right: 0, top: [0, 42]});
    });

  });

});
