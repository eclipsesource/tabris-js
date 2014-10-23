/**
 * Copyright (c) 2014 EclipseSource.
 * All rights reserved.
 */

describe("TabFolder:", function() {

  var nativeBridge, tabFolder, parent;

  beforeEach(function() {
    nativeBridge = new NativeBridgeSpy();
    tabris._reset();
    tabris._start(nativeBridge);
    parent = new tabris.Proxy("parent-id");
    tabFolder = tabris.create("TabFolder").appendTo(parent);
  });

  it("children() return empty array", function() {
    expect(tabFolder.children()).toEqual([]);
  });

  describe("paging", function() {

    it("is enabled by set", function() {
      tabFolder.set("paging", true);

      var setOp = nativeBridge.calls({id: tabFolder.id, op: "set"})[1];
      expect(setOp.properties).toEqual({data: {paging: true}});
    });

    it("is enabled by create", function() {
      tabFolder = tabris.create("TabFolder", {paging: true});

      var createOp = nativeBridge.calls({id: tabFolder.id, op: "create"})[0];
      expect(createOp.properties).toEqual({data: {paging: true}});
    });

    it("stores property locally", function() {
      expect(tabFolder.get("paging")).toBe(false);
      tabFolder.set("paging", true);
      expect(tabFolder.get("paging")).toBe(true);
    });

  });

  describe("Creating a Tab with properties", function() {

    var tab, controlCreate;

    beforeEach(function() {
      tab = tabris.create("Tab", {
        title: "foo",
        image: {src: "bar"},
        badge: "1",
        background: "#010203"
      });
      controlCreate = nativeBridge.calls({op: "create"})[1];
    });

    it("creates a Composite", function() {
      expect(controlCreate.type).toBe("rwt.widgets.Composite");
      expect(controlCreate.id).toBe(tab.id);
      expect(controlCreate.properties.background).toEqual([1, 2, 3, 255]);
    });

    it("creates no TabItem", function() {
      expect(nativeBridge.calls({op: "create", type: "rwt.widgets.TabItem"}).length).toBe(0);
    });

    describe("and then setting the parent", function() {

      var itemCreate;

      it("crashes if parent is not a TabFolder", function() {
        expect(function() {
          tabris.create("Composite").append(tab);
        }).toThrow(new Error("Tab must be a child of TabFolder"));
      });

      it("applies item properties from create", function() {
        tab.set("parent", tabFolder);
        itemCreate = nativeBridge.calls({op: "create"})[2];

        expect(itemCreate.type).toBe("rwt.widgets.TabItem");
        expect(itemCreate.properties).toEqual({
          control: controlCreate.id,
          index: 0,
          text: "foo",
          image: ["bar", null, null, null],
          badge: "1",
          parent: tabFolder.id
        });
      });

      it("applies item properties from previous set", function() {
        tab.set({
          title: "bar",
          image: {src: "foo"},
          badge: "2",
          background: "#030201"
        });
        tab.set("parent", tabFolder);
        itemCreate = nativeBridge.calls({op: "create"})[2];

        expect(itemCreate.type).toBe("rwt.widgets.TabItem");
        expect(itemCreate.properties).toEqual({
          control: controlCreate.id,
          index: 0,
          text: "bar",
          image: ["foo", null, null, null],
          badge: "2",
          parent: tabFolder.id
        });
      });

      it("applies item properties from same set", function() {
        tab.set({
          title: "bar",
          image: {src: "foo"},
          badge: "2",
          background: "#030201",
          parent: tabFolder
        });
        itemCreate = nativeBridge.calls({op: "create"})[2];

        expect(itemCreate.type).toBe("rwt.widgets.TabItem");
        expect(itemCreate.properties).toEqual({
          control: controlCreate.id,
          index: 0,
          text: "bar",
          image: ["foo", null, null, null],
          badge: "2",
          parent: tabFolder.id
        });
      });

      it("TabFolder.children() return list of Tabs", function() {
        tab.appendTo(tabFolder);

        expect(tabFolder.children()).toEqual([tab]);
      });

    });

  });

  describe("Creating a Tab with parent", function() {

    var tab, controlCreate, itemCreate;

    beforeEach(function() {
      tab = tabris.create("Tab", {
        parent: tabFolder
      });
      var createCalls = nativeBridge.calls({op: "create"});
      controlCreate = createCalls[1];
      itemCreate = createCalls[2];
    });

    it("sets the Composite parent", function() {
      expect(controlCreate.properties.parent).toBe(tabFolder.id);
    });

    it("creates a TabItem", function() {
      expect(itemCreate.type).toBe("rwt.widgets.TabItem");
      expect(itemCreate.properties.control).toBe(controlCreate.id);
      expect(itemCreate.properties.index).toBe(0);
    });

    it("sets the TabItem parent", function() {
      expect(itemCreate.properties.parent).toBe(tabFolder.id);
    });

    describe("twice", function() {

      it("increases index with each item", function() {
        tabris.create("Tab", {parent: tabFolder});
        expect(nativeBridge.calls({op: "create"})[4].properties.index).toBe(1);
      });

      it("does not increase index if previous item is disposed", function() {
        tab.dispose();
        tabris.create("Tab", {parent: tabFolder});
        expect(nativeBridge.calls({op: "create"})[4].properties.index).toBe(0);
      });

    });

  });

  describe("Tab.set", function() {

    var tab, controlSet, itemSet;

    beforeEach(function() {
      tab = tabris.create("Tab", {parent: tabFolder});
      tab.set({
        title: "foo",
        image: {src: "bar"},
        badge: "1",
        background: "#010203"
      });
      var setCalls = nativeBridge.calls({op: "set"});
      controlSet = setCalls[1];
      itemSet = setCalls[2];
    });

    it("delegates TabItem properties", function() {
      expect(itemSet.properties.text).toBe("foo");
      expect(itemSet.properties.image).toEqual(["bar", null, null, null]);
      expect(itemSet.properties.badge).toBe("1");
      expect(itemSet.properties.background).toBeUndefined();
    });

    it("forwards Control properties", function() {
      expect(controlSet.properties.background).toEqual([1, 2, 3, 255]);
    });

  });

  describe("Tab.get (with parent)", function() {

    var tab, controlId, itemId, getCalls;

    beforeEach(function() {
      tab = tabris.create("Tab", {parent: tabFolder});
      controlId = nativeBridge.calls({op: "create"})[1].id;
      itemId = nativeBridge.calls({op: "create"})[2].id;
      ["title", /*"image",*/ "badge", "visible", "parent"].forEach(function(prop) {
        tab.get(prop);
      });
      getCalls = nativeBridge.calls({op: "get"});
    });

    it("forwards Control properties", function() {
      expect(getCalls.select({property: "parent"})[0].id).toBe(controlId);
      expect(getCalls.select({property: "visible"})[0].id).toBe(controlId);
    });

    it("delegates TabItem properties", function() {
      expect(getCalls.select({property: "text"})[0].id).toBe(itemId);
      /*expect(getCalls.select({property: "image"})[0].id).toBe(itemId);*/
      expect(getCalls.select({property: "badge"})[0].id).toBe(itemId);
    });

  });

  describe("Tab.get (without parent)", function() {

    var tab;

    beforeEach(function() {
      tab = tabris.create("Tab", {
        title: "foo",
        image: {src: "bar"},
        badge: "1"
      });
    });

    it("gets TabItem property from create", function() {
      expect(tab.get("title")).toBe("foo");
      expect(tab.get("image")).toEqual({src: "bar"});
      expect(tab.get("badge")).toBe("1");
    });

    it("gets TabItem property from set", function() {
      tab.set({
        title: "bar",
        image: {src: "foo"},
        badge: "2"
      });

      expect(tab.get("title")).toBe("bar");
      expect(tab.get("image")).toEqual({src: "foo"});
      expect(tab.get("badge")).toBe("2");
    });

  });

  describe("Disposing a Tab", function() {

    var tab, disposeCalls, itemId;

    beforeEach(function() {
      tab = tabris.create("Tab", {
        parent: tabFolder
      });
      tab.dispose();
      disposeCalls = nativeBridge.calls({op: "destroy"});
      itemId = nativeBridge.calls({op: "create"})[2].id;
    });

    it("destroys the control", function() {
      expect(disposeCalls.select({id: tab.id}).length).toBe(1);
    });

    it("destroys the item", function() {
      expect(disposeCalls.select({id: itemId}).length).toBe(1);
    });

  });

});
