describe("Widgets", function() {
  /*globals _:false*/

  var nativeBridge;

  beforeEach(function() {
    nativeBridge = new NativeBridgeSpy();
    tabris._reset();
    tabris._init(nativeBridge);
  });

  afterEach(function() {
    delete tabris.TestType;
  });

  describe("tabris.registerWidget", function() {

    it("adds default listen copy", function() {
      tabris.registerWidget("TestType", {});
      expect(tabris.TestType._listen).toEqual(tabris.registerWidget._defaultListen);
      expect(tabris.TestType._listen).not.toBe(tabris.registerWidget._defaultListen);
    });

    it("adds default trigger copy", function() {
      tabris.registerWidget("TestType", {});
      expect(tabris.TestType._trigger).toEqual(tabris.registerWidget._defaultTrigger);
      expect(tabris.TestType._trigger).not.toBe(tabris.registerWidget._defaultTrigger);
    });

    it("adds default setProperty copy", function() {
      tabris.registerWidget("TestType", {});
      expect(tabris.TestType._setProperty).toEqual(tabris.registerWidget._defaultSetProperty);
      expect(tabris.TestType._setProperty).not.toBe(tabris.registerWidget._defaultSetProperty);
    });

    it("adds default getProperty copy", function() {
      tabris.registerWidget("TestType", {});
      expect(tabris.TestType._getProperty).toEqual(tabris.registerWidget._defaultGetProperty);
      expect(tabris.TestType._getProperty).not.toBe(tabris.registerWidget._defaultGetProperty);
    });

    it("extends default listen", function() {
      var custom = {foo: "bar", touchstart: false};
      tabris.registerWidget("TestType", {_listen: custom});
      expect(tabris.TestType._listen).toEqual(
        _.extend({}, tabris.registerWidget._defaultListen, custom)
      );
    });

    it("extends default trigger", function() {
      var custom = {foo: "bar", touchstart: false};
      tabris.registerWidget("TestType", {_trigger: custom});
      expect(tabris.TestType._trigger).toEqual(
        _.extend({}, tabris.registerWidget._defaultTrigger, custom)
      );
    });

    it("adds default properties copy", function() {
      tabris.registerWidget("TestType", {});
      expect(tabris.TestType._properties).toEqual(tabris.registerWidget._defaultProperties);
      expect(tabris.TestType._properties).not.toBe(tabris.registerWidget._defaultProperties);
    });

    it("extends default properties", function() {
      var custom = {foo: "bar", enabled: false};
      tabris.registerWidget("TestType", {_properties: custom});
      expect(tabris.TestType._properties).toEqual(
        _.extend({}, tabris.registerWidget._defaultProperties, custom)
      );
    });

    it("keeps _properties true", function() {
      tabris.registerWidget("TestType", {_properties: true});
      expect(tabris.TestType._properties).toBe(true);
    });

  });

  describe("any", function() {

    var widget;

    beforeEach(function() {
      tabris.registerWidget("TestType", {});
      widget = tabris.create("TestType");
      nativeBridge.resetCalls();
    });

    it("translates foreground and background colors to arrays", function() {
      widget.set({foreground: "red", background: "rgba(1, 2, 3, 0.5)"});

      var call = nativeBridge.calls({op: "set"})[0];
      expect(call.properties.foreground).toEqual([255, 0, 0, 255]);
      expect(call.properties.background).toEqual([1, 2, 3, 128]);
    });

    it("translates font string to array", function() {
      widget.set({font: "12px Arial"});

      var call = nativeBridge.calls({op: "set"})[0];
      expect(call.properties.font).toEqual([["Arial"], 12, false, false]);
    });

    it("translates backgroundImage to array", function() {
      widget.set({backgroundImage: {src: "bar", width: 23, height: 42}});

      var call = nativeBridge.calls({op: "set"})[0];
      expect(call.properties.backgroundImage).toEqual(["bar", 23, 42, null]);
    });

    it("translates bounds to array", function() {
      widget.set("bounds", {left: 1, top: 2, width: 3, height: 4});

      var call = nativeBridge.calls({op: "set"})[0];
      expect(call.properties.bounds).toEqual([1, 2, 3, 4]);
    });

    it("translates visible to visibility", function() {
      widget.set("visible", true);

      var call = nativeBridge.calls({op: "set"})[0];
      expect(call.properties.visibility).toBe(true);
    });

    it("support 'initial' for foreground, background and font", function() {
      widget.set({foreground: "initial", background: "initial", font: "initial"});

      var call = nativeBridge.calls({op: "set"})[0];
      expect(call.properties.foreground).toBeNull();
      expect(call.properties.background).toBeNull();
      expect(call.properties.font).toBeNull();
    });

    it("stores id property in proxy.id", function() {
      widget.set("id", "foo");

      expect(widget.id).toBe("foo");
    });

    it("gets id property from proxy.id", function() {
      widget.set("id", "foo");

      expect(widget.get("id")).toBe("foo");
    });

  });

  describe("get default decoding", function() {

    var widget;

    beforeEach(function() {
      tabris.registerWidget("TestType", {});
      widget = tabris.create("TestType");
      nativeBridge.resetCalls();
    });

    it("translates foreground to string", function() {
      spyOn(nativeBridge, "get").and.returnValue([170, 255, 0, 128]);

      var result = widget.get("foreground");

      expect(result).toBe("rgba(170, 255, 0, 0.5)");
    });

    it("translates background to string", function() {
      spyOn(nativeBridge, "get").and.returnValue([170, 255, 0, 128]);

      var result = widget.get("background");

      expect(result).toBe("rgba(170, 255, 0, 0.5)");
    });

    it("translates font to string", function() {
      spyOn(nativeBridge, "get").and.returnValue([["Arial"], 12, true, true]);

      var result = widget.get("font");

      expect(result).toBe("italic bold 12px Arial");
    });

    it("translates bounds to object", function() {
      spyOn(nativeBridge, "get").and.returnValue([1, 2, 3, 4]);

      var result = widget.get("bounds");

      expect(result).toEqual({left: 1, top: 2, width: 3, height: 4});
    });

    it("translates bounds to object", function() {
      spyOn(nativeBridge, "get").and.returnValue([1, 2, 3, 4]);

      var result = widget.get("bounds");

      expect(result).toEqual({left: 1, top: 2, width: 3, height: 4});
    });

    it("translates backgroundImage to object", function() {
      spyOn(nativeBridge, "get").and.returnValue(["foo", 23, 42]);

      var result = widget.get("backgroundImage");

      expect(result).toEqual({src: "foo", width: 23, height: 42});
    });

    it("translates visible to visibility", function() {
      spyOn(nativeBridge, "get");

      widget.get("visible");

      expect(nativeBridge.get).toHaveBeenCalledWith(widget.cid, "visibility");
    });

  });

  describe("layoutData:", function() {

    var parent, widget, other;

    beforeEach(function() {
      tabris.registerWidget("TestType", {});
      parent = tabris.create("Composite");
      widget = tabris.create("TestType").appendTo(parent);
      other = tabris.create("TestType", {id: "other"}).appendTo(parent);
      nativeBridge.resetCalls();
    });

    it("return null for undefined layoutData", function() {
      expect(widget.get("layoutData")).toBeNull();
    });

    it("store layoutData property locally", function() {
      widget.set("layoutData", {top: 10, left: [10, 20], right: [other, 10]});
      expect(widget.get("layoutData")).toEqual({top: 10, left: [10, 20], right: [other, 10]});
    });

    it("getter does not translate selectors", function() {
      widget.set("layoutData", {left: 23, right: "#other", top: ["#other", 42]});

      var expected = {left: 23, right: "#other", top: ["#other", 42]};
      expect(widget.get("layoutData")).toEqual(expected);
    });

    it("SET layoutData after widget referenced by selector is added to parent", function() {
      other.dispose();
      widget.set("layoutData", {left: 23, centerY: "#other", right: ["#other", 42]});
      other = tabris.create("TestType", {id: "other"}).appendTo(parent);

      var call = nativeBridge.calls({op: "set"})[0];
      var expected = {left: 23, centerY: other.cid, right: [other.cid, 42]};
      expect(call.properties.layoutData).toEqual(expected);
    });

    it("SET layoutData after self is added to parent", function() {
      widget = tabris.create("TestType");

      widget.set("layoutData", {left: 23, centerY: "#other", right: ["#other", 42]});
      widget.appendTo(parent);

      var call = nativeBridge.calls({op: "create"})[0];
      var expected = {left: 23, centerY: other.cid, right: [other.cid, 42]};
      expect(call.properties.layoutData).toEqual(expected);
    });

    it("SET preliminary layoutData if selector does not resolve in flush", function() {
      widget.set("layoutData", {left: 23, centerY: "#mother", right: ["other", 42]});

      var call = nativeBridge.calls({op: "set"})[0];
      var expected = {left: 23, centerY: 0, right: [0, 42]};
      expect(call.properties.layoutData).toEqual(expected);
    });

    it("SET layoutData again until selector resolves", function() {
      other.dispose();

      widget.set("layoutData", {right: "#other"});
      var calls1 = nativeBridge.calls({op: "set"});
      nativeBridge.resetCalls();
      var calls2 = nativeBridge.calls({op: "set"});
      nativeBridge.resetCalls();
      other = tabris.create("TestType", {id: "other"}).appendTo(parent);
      var calls3 = nativeBridge.calls({op: "set"});
      nativeBridge.resetCalls();
      var calls4 = nativeBridge.calls({op: "set"});

      expect(calls1.length).toBe(1);
      expect(calls2.length).toBe(0);
      expect(calls3.length).toBe(1);
      expect(calls4.length).toBe(0);
      expect(calls1[0].properties.layoutData).toEqual({right: [0, 0]});
      expect(calls3[0].properties.layoutData).toEqual({right: [other.cid, 0]});
    });

  });

  describe("registered types", function() {

    it("Button", function() {
      tabris.create("Button", {text: "foo"});

      var create = nativeBridge.calls({op: "create"})[0];
      expect(create.type).toEqual("rwt.widgets.Button");
      expect(create.properties).toEqual({style: ["PUSH"], text: "foo"});
    });

    it("Canvas", function() {
      tabris.create("Canvas", {});

      var create = nativeBridge.calls({op: "create"})[0];
      expect(create.type).toEqual("rwt.widgets.Canvas");
    });

    it("CheckBox", function() {
      tabris.create("CheckBox", {text: "foo"});

      var create = nativeBridge.calls({op: "create"})[0];
      expect(create.type).toEqual("rwt.widgets.Button");
      expect(create.properties).toEqual({style: ["CHECK"], text: "foo"});
    });

    it("Picker", function() {
      tabris.create("Picker", {});

      var create = nativeBridge.calls({op: "create"})[0];
      expect(create.type).toEqual("rwt.widgets.Combo");
    });

    it("Composite", function() {
      tabris.create("Composite", {});

      var create = nativeBridge.calls({op: "create"})[0];
      expect(create.type).toEqual("rwt.widgets.Composite");
    });

    it("ImageView", function() {
      tabris.create("ImageView", {});

      var create = nativeBridge.calls({op: "create"})[0];
      expect(create.type).toEqual("tabris.ImageView");
    });

    it("RadioButton", function() {
      tabris.create("RadioButton", {text: "foo"});

      var create = nativeBridge.calls({op: "create"})[0];
      expect(create.type).toEqual("rwt.widgets.Button");
      expect(create.properties).toEqual({style: ["RADIO"], text: "foo"});
    });

    it("ToggleButton", function() {
      tabris.create("ToggleButton", {text: "foo"});

      var create = nativeBridge.calls({op: "create"})[0];
      expect(create.type).toEqual("rwt.widgets.Button");
      expect(create.properties).toEqual({style: ["TOGGLE"], text: "foo"});
    });

    it("TextView", function() {
      tabris.create("TextView", {text: "foo", maxLines: null});

      var create = nativeBridge.calls({op: "create"})[0];
      expect(create.type).toEqual("tabris.TextView");
      expect(create.properties).toEqual({text: "foo", maxLines: null});
    });

    it("TextView, maxLines: 0 is mapped to null", function() {
      tabris.create("TextView", {text: "foo", maxLines: 0});

      var create = nativeBridge.calls({op: "create"})[0];
      expect(create.properties.maxLines).toBeNull();
    });

    it("TextView, maxLines: values <= 0 are mapped to null", function() {
      tabris.create("TextView", {text: "foo", maxLines: -1});

      var create = nativeBridge.calls({op: "create"})[0];
      expect(create.properties.maxLines).toBeNull();
    });

    it("Slider", function() {
      tabris.create("Slider", {selection: 23});

      var create = nativeBridge.calls({op: "create"})[0];
      expect(create.type).toEqual("rwt.widgets.Scale");
      expect(create.properties).toEqual({selection: 23});
    });

    it("TextInput", function() {
      tabris.create("TextInput", {text: "foo"});

      var create = nativeBridge.calls({op: "create"})[0];
      expect(create.type).toEqual("tabris.TextInput");
      expect(create.properties).toEqual({text: "foo"});
    });

    it("WebView", function() {
      tabris.create("WebView", {text: "foo"});

      var create = nativeBridge.calls({op: "create"})[0];
      expect(create.type).toEqual("rwt.widgets.Browser");
      expect(create.properties).toEqual({text: "foo"});
    });

  });

});
