describe("PageSelector", function() {

  var nativeBridge;

  beforeEach(function() {
    nativeBridge = new NativeBridgeSpy();
    tabris._reset();
    tabris._init(nativeBridge);
    tabris.ui = tabris.create("_UI");
    nativeBridge.resetCalls();
    // TODO: remove spy when properties are cached
    spyOn(nativeBridge, "get").and.callFake(function(target, prop) {
      if (prop === "topLevel") {
        return true;
      }
    });
  });

  afterEach(function() {
    delete tabris.ui;
  });

  describe("create", function() {

    var page1, page2, pageSelector;

    beforeEach(function() {
      page1 = tabris.create("Page", {topLevel: true});
      page2 = tabris.create("Page", {topLevel: true});
      pageSelector = tabris.create("PageSelector");
    });

    it("creates a CollectionView", function() {
      expect(pageSelector).toEqual(jasmine.any(tabris.CollectionView));
    });

    it("includes default (fill) layoutData", function() {
      expect(pageSelector.get("layoutData")).toEqual({left: 0, right: 0, top: 0, bottom: 0});
    });

    it("allows to override properties", function() {
      var pageSelector = tabris.create("PageSelector", {
        layoutData: {left: 10, top: 20}
      });

      expect(pageSelector.get("layoutData")).toEqual({left: 10, top: 20});
    });

    it("includes all pages as items", function() {
      var pageSelector = tabris.create("PageSelector");

      expect(pageSelector.get("items")).toEqual([page1, page2]);
    });

    it("adds pages dynamically", function() {
      var page3 = tabris.create("Page");

      expect(pageSelector.get("items")).toEqual([page1, page2, page3]);
    });

    it("removes pages dynamically", function() {
      page2.dispose();

      expect(pageSelector.get("items")).toEqual([page1]);
    });

    it("opens page on select", function() {
      spyOn(page1, "open");
      pageSelector.trigger("select", pageSelector, page1);

      expect(page1.open).toHaveBeenCalled();
    });

    it("closes drawer on select", function() {
      var drawer = tabris.create("Drawer");
      spyOn(drawer, "close");
      pageSelector.trigger("select", pageSelector, page1);

      expect(drawer.close).toHaveBeenCalled();
    });

  });

});
