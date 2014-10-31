/**
 * Copyright (c) 2014 EclipseSource.
 * All rights reserved.
 */

describe("List", function() {

  var nativeBridge;
  var parent;

  beforeEach(function() {
    nativeBridge = new NativeBridgeSpy();
    tabris._reset();
    tabris._start(nativeBridge);
    parent = new tabris.Proxy("parent-id");
  });

  describe("when a List is created", function() {
    var createCalls;
    var list;

    beforeEach(function() {
      list = tabris.create("List", {linesVisible: true}).appendTo(parent);
      createCalls = nativeBridge.calls({op: "create"});
    });

    it("creates a Grid with vertical scrolling", function() {
      expect(createCalls[0].type).toBe("rwt.widgets.Grid");
      expect(createCalls[0].properties.style).toEqual(["V_SCROLL"]);
      expect(createCalls[0].properties.linesVisible).toBe(true);
    });

    it("creates a vertical ScrollBar", function() {
      expect(createCalls[1].type).toBe("rwt.widgets.ScrollBar");
      expect(createCalls[1].properties.parent).toBe(createCalls[0].id);
      expect(createCalls[1].properties.style).toEqual(["VERTICAL"]);
    });

    describe("when a template is set", function() {
      var items, template;

      beforeEach(function() {
        nativeBridge.resetCalls();
        template = [
          {type: "image", binding: "icon", left: 10},
          {type: "text", binding: "name", left: 20},
          {type: "text", binding: "phone", left: 30}
        ];
        list.set("template", template);
      });

      it("SETs a row template", function() {
        expect(nativeBridge.calls({id: list.id, op: "set"})[0].properties).toEqual({rowTemplate: [
          {type: "image", bindingIndex: 0, left: 10},
          {type: "text", bindingIndex: 0, left: 20},
          {type: "text", bindingIndex: 1, left: 30}
        ]});
      });

      it("does not modify original template", function() {
        expect(template[1]).toEqual({type: "text", binding: "name", left: 20});
      });

      it("does not create any ListItems", function() {
        expect(nativeBridge.calls({op: "create"}).length).toBe(0);
      });

      it("it is returned by get", function() {
        expect(list.get("template")).toEqual(template);
      });

      describe("when items are set", function() {
        beforeEach(function() {
          nativeBridge.resetCalls();
          items = [
            {name: "Ron", phone: "00", icon: {src: "ron.jpg"}},
            {name: "Sue", phone: "01", icon: {src: "sue.jpg"}},
            {name: "Tom", phone: "02", icon: {src: "tom.jpg"}}
          ];
          list.set("items", items);
        });

        it("CREATEs GridItems with parent", function() {
          var createCalls = nativeBridge.calls({op: "create", type: "rwt.widgets.GridItem"});
          expect(createCalls[0].properties.parent).toEqual(list.id);
        });

        it("CREATEs GridItems with index", function() {
          var createCalls = nativeBridge.calls({op: "create", type: "rwt.widgets.GridItem"});
          expect(createCalls.map(function(call) {
            return call.properties.index;
          })).toEqual([0, 1, 2]);
        });

        it("SETs item count on Grid", function() {
          var listSetCalls = nativeBridge.calls({id: list.id, op: "set"});
          expect(listSetCalls[0].properties.itemCount).toBe(3);
        });

        it("they are returned by get", function() {
          expect(list.get("items")).toEqual(items);
        });

        describe("when items are set again", function() {
          beforeEach(function() {
            nativeBridge.resetCalls();
            list.set("items", [
              {name: "Ron", phone: "00", icon: {src: "ron.jpg"}},
              {name: "Tom", phone: "02", icon: {src: "tom.jpg"}}
            ]);
          });

          it("DESTROYs all GridItems", function() {
            expect(nativeBridge.calls({op: "destroy"}).length).toBe(3);
          });

          it("CREATEs new GridItems", function() {
            expect(nativeBridge.calls({op: "create", type: "rwt.widgets.GridItem"}).length).toBe(2);
          });
        });

        describe("when items are set to null", function() {
          beforeEach(function() {
            nativeBridge.resetCalls();
            list.set("items", null);
          });

          it("DESTROYs all GridItems", function() {
            expect(nativeBridge.calls({op: "destroy"}).length).toBe(3);
          });
        });
      });
    });

    describe("when a template with binding indices is set", function() {
      beforeEach(function() {
        nativeBridge.resetCalls();
        list.set("template", [
          {type: "text", binding: 0},
          {type: "text", binding: 1},
          {type: "image", binding: 2},
          {type: "image", binding: 3}
        ]);
      });

      it("translates binding to to bindingIndex", function() {
        expect(nativeBridge.calls({id: list.id, op: "set"})[0].properties).toEqual({rowTemplate: [
          {type: "text", bindingIndex: 0},
          {type: "text", bindingIndex: 1},
          {type: "image", bindingIndex: 0},
          {type: "image", bindingIndex: 1}
        ]});
      });

      describe("items are arrays", function() {
        beforeEach(function() {
          list.set("items", [
            ["Ron", "00", {src: "ron100.jpg"}, {src: "ron200.jpg"}],
            ["Sue", "01", {src: "sue100.jpg"}, {src: "sue200.jpg"}],
            ["Tom", "02", {src: "tom100.jpg"}, {src: "tom200.jpg"}]
          ]);
        });

        it("CREATEs GridItems with values from items", function() {
          var createCalls = nativeBridge.calls({op: "create", type: "rwt.widgets.GridItem"});

          expect(createCalls.map(function(call) {
            return call.properties.texts;
          })).toEqual([
            ["Ron", "00"],
            ["Sue", "01"],
            ["Tom", "02"]
          ]);

          expect(createCalls.map(function(call) {
            return call.properties.images;
          })).toEqual([
            [["ron100.jpg", null, null, null], ["ron200.jpg", null, null, null]],
            [["sue100.jpg", null, null, null], ["sue200.jpg", null, null, null]],
            [["tom100.jpg", null, null, null], ["tom200.jpg", null, null, null]]
          ]);
        });
      });
    });

    describe("when a template contains more image cells than text cells", function() {
      beforeEach(function() {
        list.set("template", [
          {type: "text", binding: 0},
          {type: "image", binding: 1},
          {type: "image", binding: 2}
        ]);
        list.set("items", [
          ["Ron", {src: "ron100.jpg"}, {src: "ron200.jpg"}]
        ]);
      });

      it("fills texts array with empty strings", function() {
        var createCall = nativeBridge.calls({op: "create", type: "rwt.widgets.GridItem"})[0];
        expect(createCall.properties.texts).toEqual(["Ron", ""]);
      });
    });

    describe("when a template contains more text cells than image cells", function() {
      beforeEach(function() {
        list.set("template", [
          {type: "text", binding: 0},
          {type: "text", binding: 1},
          {type: "image", binding: 2}
        ]);
        list.set("items", [
          ["Ron", "00", {src: "ron.jpg"}]
        ]);
      });

      it("fills images array with nulls", function() {
        var createCall = nativeBridge.calls({op: "create", type: "rwt.widgets.GridItem"})[0];
        expect(createCall.properties.images).toEqual([["ron.jpg", null, null, null], null]);
      });
    });

    describe("when a template with foreground and background is set", function() {
      beforeEach(function() {
        nativeBridge.resetCalls();
        list.set("template", [
          {type: "text", binding: 0, foreground: "red"},
          {type: "image", binding: 1, background: "blue"}
        ]);
      });

      it("translates colors to arrays", function() {
        var rowTemplate = nativeBridge.calls({id: list.id, op: "set"})[0].properties.rowTemplate;
        expect(rowTemplate[0].foreground).toEqual([255, 0, 0, 255]);
        expect(rowTemplate[1].background).toEqual([0, 0, 255, 255]);
      });
    });

    describe("when string items are set without a template", function() {
      beforeEach(function() {
        nativeBridge.resetCalls();
        list.set("items", ["Ron", "Sue", "Tom"]);
      });

      it("does not SET a rowTemplate", function() {
        expect(nativeBridge.calls({id: list.id, op: "set"}).filter(function(call) {
          return "rowTemplate" in call.properties;
        })).toEqual([]);
      });

      it("CREATEs GridItems with texts from items", function() {
        var createCalls = nativeBridge.calls({op: "create", type: "rwt.widgets.GridItem"});
        expect(createCalls.map(function(call) {
          return util.pick(call.properties, ["texts", "images"]);
        })).toEqual([
          {texts: ["Ron"], images: [null]},
          {texts: ["Sue"], images: [null]},
          {texts: ["Tom"], images: [null]}
        ]);
      });
    });

    describe("when a Selection event is received from native", function() {
      var listener, item2Id;

      beforeEach(function() {
        listener = jasmine.createSpy("listener");
        list.set("items", ["Ron", "Sue", "Tom"]);
        item2Id = nativeBridge.calls({op: "create", type: "rwt.widgets.GridItem"})[2].id;
        list.on("selection", listener);
      });

      it("translates event to contain data item and index", function() {
        tabris._notify(list.id, "Selection", {item: item2Id});
        expect(listener).toHaveBeenCalledWith({item: "Tom", index: 2, cell: ""});
      });

      it("translates event to contain text as name if present", function() {
        tabris._notify(list.id, "Selection", {item: item2Id, text: "foo"});
        expect(listener).toHaveBeenCalledWith({item: "Tom", index: 2, cell: "foo"});
      });

    });

    describe("when a Selection event is triggered", function() {
      var listener;

      beforeEach(function() {
        listener = jasmine.createSpy("listener");
        list.on("selection", listener);
        list.trigger("selection", {item: "Sue", index: 1});
      });

      it("is not affected by the translation", function() {
        expect(listener).toHaveBeenCalledWith({item: "Sue", index: 1});
      });
    });
  });

});
