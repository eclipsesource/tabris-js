describe("Layout:", function() {

  describe("checkConsistency", function() {

    var check = tabris.Layout.checkConsistency;

    beforeEach(function() {
      spyOn(console, "warn");
    });

    it("raises a warning for inconsistent layoutData (width)", function() {
      check({top: 0, left: 0, right: 0, width: 100});

      var warning = "Inconsistent layoutData: left and right are set, ignore width";
      expect(console.warn).toHaveBeenCalledWith(warning);
    });

    it("skips overridden properties from layoutData (width)", function() {
      var result = check({top: 0, left: 0, right: 0, width: 100});

      expect(result).toEqual({top: 0, left: 0, right: 0});
    });

    it("raises a warning for inconsistent layoutData (height)", function() {
      check({top: 0, left: 0, bottom: 0, height: 100});

      var warning = "Inconsistent layoutData: top and bottom are set, ignore height";
      expect(console.warn).toHaveBeenCalledWith(warning);
    });

    it("skips overridden properties from layoutData (height)", function() {
      var result = check({top: 0, left: 0, bottom: 0, height: 100});

      expect(result).toEqual({top: 0, left: 0, bottom: 0});
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
      check({left: 0, top: 0, baseline: "#other"});

      var warning = "Inconsistent layoutData: baseline overrides top, bottom, and centerY";
      expect(console.warn).toHaveBeenCalledWith(warning);
    });

    it("skips overridden properties from layoutData (baseline)", function() {
      var result = check({left: 1, top: 2, bottom: 3, centerY: 4, baseline: "other"});

      expect(result).toEqual({left: 1, baseline: "other"});
    });

  });

  describe("resolveReferences", function() {

    var resolve = tabris.Layout.resolveReferences;
    var parent, widget, other;

    beforeEach(function() {
      tabris._reset();
      tabris._init(new NativeBridgeSpy());
      tabris.registerWidget("TestType", {});
      parent = new tabris.Composite();
      widget = new tabris.TestType().appendTo(parent);
      other = new tabris.TestType({id: "other"}).appendTo(parent);
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

    it("translates 'prev()' selector to id", function() {
      var input = {baseline: "prev()", left: ["prev()", 42]};
      var expected = {baseline: widget.cid, left: [widget.cid, 42]};

      expect(resolve(input, other)).toEqual(expected);
    });

    it("translates 'prev()' selector to 0 on first widget", function() {
      var input = {baseline: "prev()", left: ["prev()", 42]};
      var expected = {baseline: 0, left: [0, 42]};

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
      var freak2 = new tabris.TestType({id: "23%"}).appendTo(parent);

      expect(resolve({left: ["Foo%", 23], top: ["#23%", 42]}, widget))
        .toEqual({left: [freak1.cid, 23], top: [freak2.cid, 42]});
    });

    it("replaces unresolved selector (due to missing sibling) with 0", function() {
      other.dispose();

      expect(resolve({baseline: "#noone", left: ["#noone", 42]}, widget))
        .toEqual({baseline: 0, left: [0, 42]});
    });

    it("replaces unresolved selector (due to missing parent) with 0", function() {
      widget = new tabris.TestType();

      expect(resolve({baseline: "#noone", left: ["#noone", 42]}, widget))
        .toEqual({baseline: 0, left: [0, 42]});
    });

  });

  describe("layoutQueue", function() {

    it("calls '_flushLayout' on registered widgets once", function() {
      var widget = {
        _flushLayout: jasmine.createSpy()
      };
      tabris.Layout.addToQueue(widget);

      tabris.Layout.flushQueue(widget);
      tabris.Layout.flushQueue(widget);

      expect(widget._flushLayout).toHaveBeenCalled();
      expect(widget._flushLayout.calls.count()).toBe(1);
    });

  });

});
