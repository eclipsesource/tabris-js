/**
 * Copyright (c) 2014 EclipseSource.
 * All rights reserved.
 */

describe("Widgets", function() {

  var nativeBridge;

  beforeEach(function() {
    nativeBridge = new NativeBridgeSpy();
    tabris._reset();
    tabris._start(nativeBridge);
  });

  describe("tabris.registerWidget", function() {

    afterEach(function() {
      delete tabris.TestType;
    });

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

    it("extends default listen", function() {
      var custom = {foo: "bar", touchstart: false};
      tabris.registerWidget("TestType", {_listen: custom});
      expect(tabris.TestType._listen).toEqual(
        util.extend({}, tabris.registerWidget._defaultListen, custom)
      );
    });

    it("extends default trigger", function() {
      var custom = {foo: "bar", touchstart: false};
      tabris.registerWidget("TestType", {_trigger: custom});
      expect(tabris.TestType._trigger).toEqual(
        util.extend({}, tabris.registerWidget._defaultTrigger, custom)
      );
    });

    it("adds default checkProperty copy", function() {
      tabris.registerWidget("TestType", {});
      expect(tabris.TestType._checkProperty).toEqual(tabris.registerWidget._defaultCheckProperty);
      expect(tabris.TestType._checkProperty).not.toBe(tabris.registerWidget._defaultCheckProperty);
    });

    it("extends default checkProperty", function() {
      var custom = {foo: "bar", enabled: false};
      tabris.registerWidget("TestType", {_checkProperty: custom});
      expect(tabris.TestType._checkProperty).toEqual(
        util.extend({}, tabris.registerWidget._defaultCheckProperty, custom)
      );
    });

    it("keeps checkProperty true", function() {
      tabris.registerWidget("TestType", {_checkProperty: true});
      expect(tabris.TestType._checkProperty).toBe(true);
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

    it("Combo", function() {
      tabris.create("Combo", {});

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

    it("Label", function() {
      tabris.create("Label", {text: "foo"});

      var create = nativeBridge.calls({op: "create"})[0];
      expect(create.type).toEqual("rwt.widgets.Label");
      expect(create.properties).toEqual({text: "foo"});
    });

    it("Slider", function() {
      tabris.create("Slider", {selection: 23});

      var create = nativeBridge.calls({op: "create"})[0];
      expect(create.type).toEqual("rwt.widgets.Scale");
      expect(create.properties).toEqual({selection: 23});
    });

    it("Text", function() {
      tabris.create("Text", {text: "foo"});

      var create = nativeBridge.calls({op: "create"})[0];
      expect(create.type).toEqual("rwt.widgets.Text");
      expect(create.properties).toEqual({style: ["BORDER", "SINGLE"], text: "foo"});
    });

    it("Text (type='password')", function() {
      tabris.create("Text", {type: "password"});

      var create = nativeBridge.calls({op: "create"})[0];
      expect(create.type).toEqual("rwt.widgets.Text");
      expect(create.properties.style).toEqual(["BORDER", "SINGLE", "PASSWORD"]);
    });

    it("Text (type='search')", function() {
      tabris.create("Text", {type: "search"});

      var create = nativeBridge.calls({op: "create"})[0];
      expect(create.type).toEqual("rwt.widgets.Text");
      expect(create.properties.style).toEqual(["BORDER", "SINGLE", "SEARCH"]);
    });

    it("Text (type='multiline')", function() {
      tabris.create("Text", {type: "multiline"});

      var create = nativeBridge.calls({op: "create"})[0];
      expect(create.type).toEqual("rwt.widgets.Text");
      expect(create.properties.style).toEqual(["BORDER", "MULTI"]);
    });

    it("WebView", function() {
      tabris.create("WebView", {text: "foo"});

      var create = nativeBridge.calls({op: "create"})[0];
      expect(create.type).toEqual("rwt.widgets.Browser");
      expect(create.properties).toEqual({text: "foo"});
    });

  });

});
