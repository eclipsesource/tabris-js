/**
 * Copyright (c) 2014 EclipseSource.
 * All rights reserved.
 */

describe("Proxy", function() {

  var consoleBackup = window.console;
  var nativeBridge;
  var log;

  beforeEach(function() {
    window.console = jasmine.createSpyObj("console", ["log", "info", "warn", "error"]);
    nativeBridge = new NativeBridgeSpy();
    log = [];
    tabris._reset();
    tabris._start(nativeBridge);
  });

  afterEach(function() {
    window.console = consoleBackup;
  });

  describe("create", function() {

    var proxy;

    beforeEach(function() {
      proxy = new tabris.Proxy("test-id");
      proxy.type = "TestType";
    });

    it("creates proxy for standard types", function() {
      tabris.create("rwt.widgets.Button", {style: ["PUSH"], text: "foo"});

      var create = nativeBridge.calls({op: "create"})[0];
      expect(create.type).toEqual("rwt.widgets.Button");
      expect(create.properties).toEqual({style: ["PUSH"], text: "foo"});
    });

    it("calls native create with properties", function() {
      proxy._create({foo: 23});

      var calls = nativeBridge.calls({op: "create", type: "TestType"});
      expect(calls.length).toBe(1);
      expect(calls[0].properties).toEqual({foo: 23});
    });

    it("translates properties", function() {
      var other = new tabris.Proxy("other-id");

      proxy._create({foo: other});

      var properties = nativeBridge.calls({op: "create", type: "TestType"})[0].properties;
      expect(properties.foo).toBe("other-id");
    });

    it("does not modify prototype properties", function() {
      tabris.registerType("CustomType", {_properties: {}});

      tabris.create("CustomType", {foo: 23});

      expect(tabris.CustomType._properties).toEqual({});
      delete tabris.CustomType;
    });

  });

  describe("instance", function() {

    var proxy;

    beforeEach(function() {
      proxy = new tabris.Proxy("test-id");
    });

    it("parent() returns nothing", function() {
      expect(proxy.parent()).not.toBeDefined();
    });

    it("children() returns empty array", function() {
      expect(proxy.children()).toEqual([]);
    });

    describe("when disposed", function() {
      beforeEach(function() {
        proxy.dispose();
      });

      it("calling append fails", function() {
        expect(function() {
          proxy.append();
        }).toThrowError("Object is disposed");
      });

      it("calling appendTo fails", function() {
        expect(function() {
          proxy.append();
        }).toThrowError("Object is disposed");
      });

      it("parent() returns nothing", function() {
        expect(proxy.parent()).not.toBeDefined();
      });

      it("children() returns empty array", function() {
        expect(proxy.children()).toEqual([]);
      });

    });

    describe("calling append with a proxy", function() {
      var child, result;

      beforeEach(function() {
        child = tabris.create("Label", {});
        nativeBridge.resetCalls();
        result = proxy.append(child);
      });

      it("sets the child's parent", function() {
        var calls = nativeBridge.calls();
        expect(calls.length).toBe(1);
        expect(calls[0]).toEqual({op: "set", id: child.id, properties: {parent: proxy.id}});
      });

      it("returns self to allow chaining", function() {
        expect(result).toBe(proxy);
      });

      it("children() contains appended child", function() {
        expect(proxy.children()).toContain(child);
      });

      it("children() returns a safe copy", function() {
        proxy.children()[0] = null;
        expect(proxy.children()).toContain(child);
      });

    });

    describe("append with multiple proxies", function() {
      var child1, child2, result;

      beforeEach(function() {
        child1 = tabris.create("Label", {});
        child2 = tabris.create("Label", {});
        nativeBridge.resetCalls();
        result = proxy.append(child1, child2);
      });

      it("sets the children's parent", function() {
        var calls = nativeBridge.calls();
        expect(calls.length).toBe(2);
        expect(calls[1]).toEqual({op: "set", id: child2.id, properties: {parent: proxy.id}});
      });

      it("returns self to allow chaining", function() {
        expect(result).toBe(proxy);
      });

      it("children() contains appended children", function() {
        expect(proxy.children()).toContain(child1);
        expect(proxy.children()).toContain(child2);
      });

    });

    describe("append with non-widget", function() {

      it("throws an error", function() {
        expect(function() {
          proxy.append({});
        }).toThrowError("Cannot append non-widget");
      });

    });

    describe("calling appendTo with a parent", function() {

      var parent1, result;

      beforeEach(function() {
        parent1 = tabris.create("Composite", {});
        nativeBridge.resetCalls();
        result = proxy.appendTo(parent1);
      });

      it("returns self to allow chaining", function() {
        expect(result).toBe(proxy);
      });

      it("sets the proxy's parent", function() {
        var setCall = nativeBridge.calls({op: "set", id: proxy.id})[0];
        expect(setCall.properties.parent).toEqual(parent1.id);
      });

      it("is added to parent's children list", function() {
        expect(parent1.children()).toContain(proxy);
      });

      it("parent() returns new parent", function() {
        expect(result.parent()).toBe(parent1);
      });

      describe("calling appendTo with another parent", function() {

        var parent2;

        beforeEach(function() {
          parent2 = tabris.create("Composite", {});
          proxy.appendTo(parent2);
        });

        it("is removed from old parent's children list", function() {
          expect(parent1.children()).not.toContain(proxy);
        });

        it("is added to new parent's children list", function() {
          expect(parent2.children()).toContain(proxy);
        });
      });

    });

    describe("appendTo with non-widget", function() {

      it("throws an error", function() {
        expect(function() {
          proxy.appendTo({});
        }).toThrowError("Cannot append to non-widget");
      });

    });

    describe("get", function() {

      it("calls native get", function() {
        proxy.get("foo");

        expect(nativeBridge.calls({op: "get", property: "foo"}).length).toBe(1);
      });

      it("returns value from native", function() {
        spyOn(nativeBridge, "get").and.returnValue(23);

        var result = proxy.get("prop");

        expect(result).toBe(23);
      });

      it("translates foreground to string", function() {
        spyOn(nativeBridge, "get").and.returnValue([170, 255, 0, 128]);

        var result = proxy.get("foreground");

        expect(result).toBe("rgba(170, 255, 0, 0.5)");
      });

      it("translates background to string", function() {
        spyOn(nativeBridge, "get").and.returnValue([170, 255, 0, 128]);

        var result = proxy.get("background");

        expect(result).toBe("rgba(170, 255, 0, 0.5)");
      });

      it("translates font to string", function() {
        spyOn(nativeBridge, "get").and.returnValue([["Arial"], 12, true, true]);

        var result = proxy.get("font");

        expect(result).toBe("italic bold 12px Arial");
      });

      it("translates image to object", function() {
        spyOn(nativeBridge, "get").and.returnValue(["foo", 23, 42]);

        var result = proxy.get("image");

        expect(result).toEqual({src: "foo", width: 23, height: 42});
      });

      it("translates bounds to object", function() {
        spyOn(nativeBridge, "get").and.returnValue([1, 2, 3, 4]);

        var result = proxy.get("bounds");

        expect(result).toEqual({left:1, top:2, width: 3, height: 4});
      });

      it("translates bounds to object", function() {
        spyOn(nativeBridge, "get").and.returnValue([1, 2, 3, 4]);

        var result = proxy.get("bounds");

        expect(result).toEqual({left:1, top:2, width: 3, height: 4});
      });

      it("translates backgroundImage to object", function() {
        spyOn(nativeBridge, "get").and.returnValue(["foo", 23, 42]);

        var result = proxy.get("backgroundImage");

        expect(result).toEqual({src: "foo", width: 23, height: 42});
      });

      it("fails on disposed object", function() {
        proxy.dispose();

        expect(function() {
          proxy.get("foo");
        }).toThrowError("Object is disposed");
      });

    });

    describe("set", function() {

      it("translates widgets to ids in properties", function() {
        var other = new tabris.Proxy("other-id");

        proxy.set("foo", other);

        var call = nativeBridge.calls({op: "set", id: proxy.id})[0];
        expect(call.properties.foo).toBe("other-id");
      });

      it("does not translate objects with id field to ids", function() {
        var obj = {id: "23", name: "bar"};

        proxy.set("foo", obj);

        var properties = nativeBridge.calls({op: "set", id: proxy.id})[0].properties;
        expect(properties.foo).toEqual(obj);
      });

      it("translation does not modify properties", function() {
        var other = new tabris.Proxy("other-id");
        var properties = {foo: other};

        proxy.set(properties);

        expect(properties.foo).toBe(other);
      });

      it("raises a warning for incomplete horizontal layoutData", function() {
        proxy.set("layoutData", {top: 0});

        var warning = "Incomplete layoutData: either left, right or centerX should be specified";
        expect(console.warn).toHaveBeenCalledWith(warning);
      });

      it("raises a warning for incomplete vertical layoutData", function() {
        proxy.set("layoutData", {left: 0});

        var warning = "Incomplete layoutData: either top, bottom, centerY, or baseline should be specified";
        expect(console.warn).toHaveBeenCalledWith(warning);
      });

      it("raises a warning for inconsistent layoutData (centerX)", function() {
        proxy.set("layoutData", {top: 0, left: 0, centerX: 0});

        var warning = "Inconsistent layoutData: centerX overrides left and right";
        expect(console.warn).toHaveBeenCalledWith(warning);
      });

      it("skips overridden properties from layoutData (centerX)", function() {
        proxy.set("layoutData", {top: 1, left: 2, right: 3, centerX: 4});

        var call = nativeBridge.calls({op: "set"})[0];
        expect(call.properties.layoutData).toEqual({top: 1, centerX: 4});
      });

      it("raises a warning for inconsistent layoutData (centerY)", function() {
        proxy.set("layoutData", {left: 0, top: 0, centerY: 0});

        var warning = "Inconsistent layoutData: centerY overrides top and bottom";
        expect(console.warn).toHaveBeenCalledWith(warning);
      });

      it("skips overridden properties from layoutData (centerY)", function() {
        proxy.set("layoutData", {left: 1, top: 2, bottom: 3, centerY: 4});

        var call = nativeBridge.calls({op: "set"})[0];
        expect(call.properties.layoutData).toEqual({left: 1, centerY: 4});
      });

      it("raises a warning for inconsistent layoutData (baseline)", function() {
        proxy.set("layoutData", {left: 0, top: 0, baseline: 0});

        var warning = "Inconsistent layoutData: baseline overrides top, bottom, and centerY";
        expect(console.warn).toHaveBeenCalledWith(warning);
      });

      it("skips overridden properties from layoutData (baseline)", function() {
        proxy.set("layoutData", {left: 1, top: 2, bottom: 3, centerY: 4, baseline: "other"});

        var call = nativeBridge.calls({op: "set"})[0];
        expect(call.properties.layoutData).toEqual({left: 1, baseline: "other"});
      });

      it("translates widgets to ids in layoutData", function() {
        var other = new tabris.Proxy("other-id");

        proxy.set("layoutData", {left: 23, right: other, top: [other, 42]});

        var call = nativeBridge.calls({op: "set"})[0];
        var expected = {left: 23, right: other.id, top: [other.id, 42]};
        expect(call.properties.layoutData).toEqual(expected);
      });

      it("translation does not modify layoutData", function() {
        var other = new tabris.Proxy("other-id");
        var layoutData = {left: 23, right: other, top: [other, 42]};

        proxy.set({layoutData: layoutData});

        expect(layoutData.top).toEqual([other, 42]);
      });

      it("translates foreground and background colors to arrays", function() {
        proxy.set({foreground: "red", background: "rgba(1, 2, 3, 0.5)"});

        var call = nativeBridge.calls({op: "set"})[0];
        expect(call.properties.foreground).toEqual([255, 0, 0, 255]);
        expect(call.properties.background).toEqual([1, 2, 3, 128]);
      });

      it("translates font string to array", function() {
        proxy.set({font: "12px Arial"});

        var call = nativeBridge.calls({op: "set"})[0];
        expect(call.properties.font).toEqual([["Arial"], 12, false, false]);
      });

      it("translates image and backgroundImage to array", function() {
        proxy.set({
          image: {src: "foo", width: 23, height: 42},
          backgroundImage: {src: "bar", width: 23, height: 42}
        });

        var call = nativeBridge.calls({op: "set"})[0];
        expect(call.properties.image).toEqual(["foo", 23, 42, null]);
        expect(call.properties.backgroundImage).toEqual(["bar", 23, 42, null]);
      });

      it("skips properties that fail to encode", function() {
        proxy.set({foo: 23, foreground: "unknown"});

        var call = nativeBridge.calls({op: "set"})[0];
        expect(call.properties).toEqual({foo: 23});
      });

      it("issues warning for properties that fail to encode", function() {
        proxy.set({foo: 23, foreground: "unknown"});

        expect(window.console.warn)
            .toHaveBeenCalledWith("Unsupported foreground value: invalid color: unknown");
      });

      it("returns self to allow chaining", function() {
        var result = proxy.set("foo", 23);

        expect(result).toBe(proxy);
      });

      it("fails on disposed object", function() {
        proxy.dispose();

        expect(function() {
          proxy.set("foo", 23);
        }).toThrowError("Object is disposed");
      });

      it("translates bounds to array", function() {
        proxy.set("bounds", {left: 1, top: 2, width: 3, height: 4});

        var call = nativeBridge.calls({op: "set"})[0];
        expect(call.properties.bounds).toEqual([1, 2, 3, 4]);
      });

    });

    describe("animate", function() {

      it("create internal animate", function() {
        spyOn(tabris.Animation, "animate");

        var result = proxy.animate({foo: "bar"}, {foo2: "bar2"});

        expect(result).not.toBeDefined();
        expect(tabris.Animation.animate).toHaveBeenCalledWith(proxy, {foo: "bar"}, {foo2: "bar2"});
      });

    });

    describe("call", function() {

      it("calls native call", function() {
        proxy.call("method", {foo: 23});

        var call = nativeBridge.calls()[0];
        expect(call.op).toEqual("call");
        expect(call.method).toEqual("method");
        expect(call.parameters).toEqual({foo: 23});
      });

      it("returns value from native", function() {
        spyOn(nativeBridge, "call").and.returnValue(23);

        var result = proxy.call("method", {});

        expect(result).toBe(23);
      });

      it("fails on disposed object", function() {
        proxy.dispose();

        expect(function() {
          proxy.call("foo", {});
        }).toThrowError("Object is disposed");
      });

    });

    describe("on", function() {

      var listener;

      beforeEach(function() {
        listener = jasmine.createSpy("listener");
        nativeBridge.resetCalls();
      });

      it("calls native listen (true) for first listener", function() {
        proxy.on("foo", listener);

        var call = nativeBridge.calls({op: "listen", event: "foo"})[0];
        expect(call.listen).toEqual(true);
      });

      it("calls native listen with translated event name", function() {
        proxy.on("focus", listener);

        var call = nativeBridge.calls({op: "listen"})[0];
        expect(call.event).toBe("FocusIn");
      });

      it("calls native listen for another listener for another event", function() {
        proxy.on("foo", listener);
        proxy.on("bar", listener);

        var call = nativeBridge.calls({op: "listen", event: "bar"})[0];
        expect(call.listen).toEqual(true);
      });

      it("does not call native listen for subsequent listeners for the same event", function() {
        proxy.on("foo", listener);
        proxy.on("foo", listener);

        expect(nativeBridge.calls({op: "listen"}).length).toBe(1);
      });

      it("returns self to allow chaining", function() {
        var result = proxy.on("foo", listener);

        expect(result).toBe(proxy);
      });

      it("fails on disposed object", function() {
        proxy.dispose();

        expect(function() {
          proxy.on("foo", listener);
        }).toThrowError("Object is disposed");
      });

    });

    describe("off", function() {

      var listener, listener2;

      beforeEach(function() {
        listener = jasmine.createSpy("listener");
        listener2 = jasmine.createSpy("listener2");
        proxy.on("foo", listener);
        nativeBridge.resetCalls();
      });

      it("calls native listen (false) for last listener removed", function() {
        proxy.off("foo", listener);

        var call = nativeBridge.calls({op: "listen", event: "foo"})[0];
        expect(call.listen).toBe(false);
      });

      it("calls native listen with translated event name", function() {
        proxy.on("focus", listener);
        proxy.off("focus", listener);

        var call = nativeBridge.calls({op: "listen"})[1];
        expect(call.event).toBe("FocusIn");
      });

      it("does not call native listen when other listeners exist for same event", function() {
        proxy.on("foo", listener2);
        proxy.off("foo", listener);

        expect(nativeBridge.calls().length).toBe(0);
      });

      it("returns self to allow chaining", function() {
        var result = proxy.off("foo", listener);

        expect(result).toBe(proxy);
      });

      it("fails on disposed object", function() {
        proxy.dispose();

        expect(function() {
          proxy.off("foo", listener);
        }).toThrowError("Object is disposed");
      });

    });

    describe("dispose", function() {

      it("calls native destroy", function() {
        proxy.dispose();

        var destroyCall = nativeBridge.calls({op: "destroy", id: proxy.id})[0];
        expect(destroyCall).toBeDefined();
      });

      it("notifies dispose listeners", function() {
        var listener = jasmine.createSpy();
        proxy.on("dispose", listener);

        proxy.dispose();

        expect(listener).toHaveBeenCalled();
        expect(listener.calls.first().args).toEqual([{}]);
      });

      it("notifies all children's dispose listeners", function() {
        var child1 = tabris.create("type", {}).appendTo(proxy);
        var child2 = tabris.create("type", {}).appendTo(proxy);

        proxy.on("dispose", function() {
          log.push("parent");
        });
        child1.on("dispose", function() {
          log.push("child1");
        });
        child2.on("dispose", function() {
          log.push("child2");
        });

        proxy.dispose();

        expect(log).toEqual(["child1", "child2", "parent"]);
      });

      it("notifies children's dispose listeners recursively", function() {
        var parent = tabris.create("type", {});
        var child = tabris.create("type", {}).appendTo(parent);
        var grandchild = tabris.create("type", {}).appendTo(child);
        parent.on("dispose", function() {
          log.push("parent");
        });
        child.on("dispose", function() {
          log.push("child");
        });
        grandchild.on("dispose", function() {
          log.push("grandchild");
        });

        parent.dispose();

        expect(log).toEqual(["grandchild", "child", "parent"]);
      });

      it("does not call native destroy on children", function() {
        tabris.create("type", {parent: proxy});

        proxy.dispose();

        expect(nativeBridge.calls({op: "destroy"}).length).toBe(1);
      });

      it("does not call native destroy twice when called twice", function() {
        proxy.dispose();
        proxy.dispose();

        expect(nativeBridge.calls({op: "destroy"}).length).toBe(1);
      });

      it("unregisters from parent to allow garbage collection", function() {
        var child = tabris.create("Label", {}).appendTo(proxy);

        child.dispose();

        expect(proxy.children()).toEqual([]);
      });

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
