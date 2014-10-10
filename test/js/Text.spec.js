/**
 * Copyright (c) 2014 EclipseSource.
 * All rights reserved.
 */

describe("Text", function() {

  var nativeBridge;

  beforeEach(function() {
    nativeBridge = new NativeBridgeSpy();
    tabris._reset();
    tabris._start(nativeBridge);
  });

  describe("create", function() {

    it("returns Text proxy", function() {
      var text = tabris.create("Text", {text: "foo"});

      expect(text).toEqual(jasmine.any(tabris.Proxy));
      expect(text.type).toEqual("Text");
    });

    it("maps 'Text' to rwt.widgets.Text [BORDER]", function() {
      tabris.create("Text", {text: "foo"});

      var create = nativeBridge.calls({op: "create"})[0];
      expect(create.type).toEqual("rwt.widgets.Text");
      expect(create.properties).toEqual({style: ["BORDER"], text: "foo"});
    });

    it("maps 'Text' with type 'password' to rwt.widgets.Text [PASSWORD]", function() {
      tabris.create("Text", {type: "password", text: "foo"});

      var create = nativeBridge.calls({op: "create"})[0];
      expect(create.type).toEqual("rwt.widgets.Text");
      expect(create.properties.style).toEqual(["BORDER", "PASSWORD"]);
    });

    it("maps 'Text' with type 'search' to rwt.widgets.Text [SEARCH]", function() {
      tabris.create("Text", {type: "search", text: "foo"});

      var create = nativeBridge.calls({op: "create"})[0];
      expect(create.type).toEqual("rwt.widgets.Text");
      expect(create.properties.style).toEqual(["BORDER", "SEARCH"]);
    });

    it("maps 'Text' with type 'multiline' to rwt.widgets.Text [MULTI]", function() {
      tabris.create("Text", {type: "multiline", text: "foo"});

      var create = nativeBridge.calls({op: "create"})[0];
      expect(create.type).toEqual("rwt.widgets.Text");
      expect(create.properties.style).toEqual(["BORDER", "MULTI"]);
    });

  });

});
