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
      proxy._type = "TestType";
    });

    it("creates proxy for standard types", function() {
      tabris.create("rwt.widgets.Button", {style: ["PUSH"], text: "foo"});

      var create = nativeBridge.calls({op: "create"})[0];
      expect(create.type).toEqual("rwt.widgets.Button");
      expect(create.properties).toEqual({style: ["PUSH"], text: "foo"});
    });

    it("maps 'Button' to rwt.widgets.Button [PUSH]", function() {
      tabris.create("Button", {text: "foo"});

      var create = nativeBridge.calls({op: "create"})[0];
      expect(create.type).toEqual("rwt.widgets.Button");
      expect(create.properties).toEqual({style: ["PUSH"], text: "foo"});
    });

    it("maps 'CheckBox' to rwt.widgets.Button [CHECK]", function() {
      tabris.create("CheckBox", {text: "foo"});

      var create = nativeBridge.calls({op: "create"})[0];
      expect(create.type).toEqual("rwt.widgets.Button");
      expect(create.properties).toEqual({style: ["CHECK"], text: "foo"});
    });

    it("maps 'RadioButton' to rwt.widgets.Button [RADIO]", function() {
      tabris.create("RadioButton", {text: "foo"});

      var create = nativeBridge.calls({op: "create"})[0];
      expect(create.type).toEqual("rwt.widgets.Button");
      expect(create.properties).toEqual({style: ["RADIO"], text: "foo"});
    });

    it("maps 'ToggleButton' to rwt.widgets.Button [TOGGLE]", function() {
      tabris.create("ToggleButton", {text: "foo"});

      var create = nativeBridge.calls({op: "create"})[0];
      expect(create.type).toEqual("rwt.widgets.Button");
      expect(create.properties).toEqual({style: ["TOGGLE"], text: "foo"});
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

    it("translation does not modify properties", function() {
      var other = new tabris.Proxy("other-id");
      var properties = {foo: other};

      proxy._create(properties);

      expect(properties.foo).toBe(other);
    });

    it("accepts rwt types without prefix", function() {
      delete proxy._type;
      proxy.type = "Label";
      proxy._create({});

      expect(nativeBridge.calls({op: "create"})[0].type).toEqual("rwt.widgets.Label");
    });

    it("accepts prefixed types", function() {
      delete proxy._type;
      proxy.type = "custom.Label";
      proxy._create({});

      expect(nativeBridge.calls({op: "create"})[0].type).toEqual("custom.Label");
    });

  });

  describe("when created", function() {

    var proxy;

    beforeEach(function() {
      proxy = new tabris.Proxy("test-id");
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

    });

    describe("append with non-widget", function() {

      it("throws an error", function() {
        expect(function() {
          proxy.append({});
        }).toThrowError("Cannot append non-widget");
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
        proxy.set("layoutData", {});

        var warning = "Unsupported layoutData value: either left or right should be specified";
        expect(console.warn).toHaveBeenCalledWith(warning);
      });

      it("raises a warning for incomplete vertical layoutData", function() {
        proxy.set("layoutData", {left: 0});

        var warning = "Unsupported layoutData value: either top or bottom should be specified";
        expect(console.warn).toHaveBeenCalledWith(warning);
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

      it("translates image annd backgroundImage to array", function() {
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

    });

    describe("when parent is set", function() {
      var parent1 = new tabris.Proxy("parent1");
      var parent2 = new tabris.Proxy("parent2");

      beforeEach(function() {
        proxy.set({parent: parent1});
      });

      it("is added to parent's children list", function() {
        expect(parent1._children).toContain(proxy);
      });

      describe("when another parent is set", function() {
        beforeEach(function() {
          proxy.set({parent: parent2});
        });

        it("is removed from old parent's children list", function() {
          expect(parent1._children).not.toContain(proxy);
        });

        it("is added to new parent's children list", function() {
          expect(parent2._children).toContain(proxy);
        });
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
        proxy.on("focusin", listener); // example with not just one upper case character!

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
        proxy.on("focusin", listener);
        proxy.off("focusin", listener);

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
        var child1 = tabris.create("type", {parent: proxy});
        var child2 = tabris.create("type", {parent: proxy});

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
        var child = tabris.create("type", {parent: parent});
        var grandchild = tabris.create("type", {parent: child});
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
        var child = tabris.create("Label", {parent: proxy});

        child.dispose();

        expect(proxy._children.length).toBe(0);
      });

    });

  });

});
