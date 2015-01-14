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
    tabris.registerType("TestType", {
      _supportsChildren: true
    });
  });

  afterEach(function() {
    window.console = consoleBackup;
    delete tabris.TestType;
  });

  describe("create", function() {

    var proxy;

    beforeEach(function() {
      proxy = tabris.create("TestType");
      nativeBridge.resetCalls();
    });

    afterEach(function() {
      delete tabris.CustomType;
    });

    it("creates proxy for standard types", function() {
      tabris.create("Button", {text: "foo"});

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

    it("sends native set for init properties", function() {
      tabris.registerType("CustomType", {_initProperties: {foo: 23}, _properties: true});

      tabris.create("CustomType", {bar: 42});

      var properties = nativeBridge.calls({op: "create", type: "CustomType"})[0].properties;
      expect(properties).toEqual({foo: 23, bar: 42});
    });

    it("does not raise warning for init properties", function() {
      tabris.registerType("CustomType", {_initProperties: {foo: 23}});

      tabris.create("CustomType", {});

      expect(console.warn).not.toHaveBeenCalled();
    });

    it("does not modify prototype properties", function() {
      tabris.registerType("CustomType", {_initProperties: {}});

      tabris.create("CustomType", {foo: 23});

      expect(tabris.CustomType._initProperties).toEqual({});
    });

  });

  describe("instance", function() {

    var proxy;

    beforeEach(function() {
      proxy = tabris.create("TestType");
      nativeBridge.resetCalls();
    });

    it("parent() returns nothing", function() {
      expect(proxy.parent()).not.toBeDefined();
    });

    it("children() returns empty collection", function() {
      expect(proxy.children()).toEqual(jasmine.any(tabris.ProxyCollection));
      expect(proxy.children().length).toBe(0);
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

      it("children() returns empty collection", function() {
        expect(proxy.children().toArray()).toEqual([]);
      });

    });

    describe("calling append with a proxy", function() {
      var child, result, listener;

      beforeEach(function() {
        listener = jasmine.createSpy();
        child = tabris.create("Label", {});
        nativeBridge.resetCalls();
        proxy.on("addchild", listener);
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

      it("notifies add listeners with arguments child, parent, event", function() {
        var args = listener.calls.argsFor(0);
        expect(args[0]).toBe(child);
        expect(args[1]).toBe(proxy);
        expect(args[2]).toEqual({});
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
        child2 = tabris.create("Button", {});
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

      it("children() with matcher contains filtered children", function() {
        expect(proxy.children("Label").toArray()).toEqual([child1]);
        expect(proxy.children("Button").toArray()).toEqual([child2]);
      });

    });

    describe("append with proxy collection", function() {
      var child1, child2, result;

      beforeEach(function() {
        child1 = tabris.create("Label", {});
        child2 = tabris.create("Label", {});
        nativeBridge.resetCalls();
        result = proxy.append(new tabris.ProxyCollection([child1, child2]));
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

    describe("append when children are not supported", function() {

      it("throws an error", function() {
        tabris.TestType._supportsChildren = false;
        var child = tabris.create("Label", {});

        expect(function() {
          proxy.append(child);
        }).toThrowError("TestType cannot contain children");
        expect(proxy.children()).not.toContain(child);
      });

    });

    describe("append children of unsupported type", function() {

      it("logs an error", function() {
        tabris.TestType._supportsChildren = function() { return false; };
        var child = tabris.create("Label", {});

        expect(function() {
          proxy.append(child);
        }).toThrowError("TestType cannot contain children of type Label");
        expect(proxy.children()).not.toContain(child);
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

    describe("calling appendTo with a collection", function() {

      var parent1, parent2, result;

      beforeEach(function() {
        parent1 = tabris.create("Composite", {});
        parent2 = tabris.create("Composite", {});
        nativeBridge.resetCalls();
        result = proxy.appendTo(new tabris.ProxyCollection([parent1, parent2]));
      });

      it("returns self to allow chaining", function() {
        expect(result).toBe(proxy);
      });

      it("first entry is added to parent's children list", function() {
        expect(parent1.children()).toContain(proxy);
      });

      it("other entry not added to parent's children list", function() {
        expect(parent2.children()).not.toContain(proxy);
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

      it("returns value from custom _getProperty", function() {
        tabris.TestType._getProperty.prop = function() { return 23; };

        var result = proxy.get("prop");

        expect(result).toBe(23);
      });

      it("raises a warning for unknown property", function() {
        proxy.get("unknownProperty", true);

        var warning = "TestType: Unknown property \"unknownProperty\"";
        expect(console.warn).toHaveBeenCalledWith(warning);
      });

      it("raises no warning if _propertyCheck entry is a string", function() {
        tabris.TestType._properties.knownProperty = "foo";
        proxy.get("knownProperty", true);

        expect(console.warn).not.toHaveBeenCalled();
      });

      it("raises no warning if _propertyCheck entry is true", function() {
        tabris.TestType._properties.knownProperty = true;
        proxy.get("knownProperty", true);

        expect(console.warn).not.toHaveBeenCalled();
      });

      it("raises no warning if _propertyCheck itself is true", function() {
        tabris.TestType._properties = true;
        proxy.get("knownProperty", true);

        expect(console.warn).not.toHaveBeenCalled();
      });

      it("calls function if _propertyCheck is a string found in PropertyDecoding", function() {
        tabris.TestType._properties.knownProperty = "color";
        spyOn(nativeBridge, "get").and.returnValue(23);
        spyOn(tabris.PropertyDecoding, "color").and.returnValue("foo");

        var result = proxy.get("knownProperty");

        expect(result).toBe("foo");
        expect(tabris.PropertyDecoding.color).toHaveBeenCalledWith(23);
        expect(console.warn).not.toHaveBeenCalled();
      });

      it("calls function if _propertyCheck is an array", function() {
        tabris.TestType._properties.knownProperty = ["color", 1, 2, 3];
        spyOn(nativeBridge, "get").and.returnValue(23);
        spyOn(tabris.PropertyDecoding, "color").and.returnValue("foo");

        var result = proxy.get("knownProperty");

        expect(result).toBe("foo");
        expect(tabris.PropertyDecoding.color).toHaveBeenCalledWith(23, 1, 2, 3);
        expect(console.warn).not.toHaveBeenCalled();
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

      it("translates widget collection to first ids in properties", function() {
        var other = new tabris.ProxyCollection([new tabris.Proxy("other-id")]);

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

      it("uses custom setProperty function", function() {
        tabris.TestType._setProperty.foo = jasmine.createSpy();

        proxy.set("foo", "bar");

        expect(nativeBridge.calls({op: "set", id: proxy.id}).length).toBe(0);
        expect(tabris.TestType._setProperty.foo).toHaveBeenCalledWith("bar");
      });

      it("raises a warning for unknown property", function() {
        proxy.set("unknownProperty", true);

        var warning = "TestType: Unknown property \"unknownProperty\"";
        expect(console.warn).toHaveBeenCalledWith(warning);
      });

      it("raises no warning if _properties entry is true", function() {
        tabris.TestType._properties.knownProperty = true;
        proxy.set("knownProperty", true);

        expect(console.warn).not.toHaveBeenCalled();
      });

      it("raises no warning if _properties itself is true", function() {
        tabris.TestType._properties = true;
        proxy.set("knownProperty", true);

        expect(console.warn).not.toHaveBeenCalled();
      });

      it("raises no warning if _properties entry is a string", function() {
        tabris.TestType._properties.knownProperty = "foo";
        proxy.set("knownProperty", true);

        expect(console.warn).not.toHaveBeenCalled();
      });

      it("calls function if _properties entry is a string found in PropertyEncoding", function() {
        tabris.TestType._properties.knownProperty = "boolean";
        spyOn(tabris.PropertyEncoding, "boolean").and.returnValue(true);

        proxy.set("knownProperty", true);

        expect(tabris.PropertyEncoding.boolean).toHaveBeenCalled();
        expect(console.warn).not.toHaveBeenCalled();
      });

      it("calls function with args if _properties entry is an array", function() {
        tabris.TestType._properties.knownProperty = ["choice", ["a", "b", "c"]];
        spyOn(tabris.PropertyEncoding, "choice").and.returnValue(true);

        proxy.set("knownProperty", "a");

        expect(tabris.PropertyEncoding.choice).toHaveBeenCalledWith("a", ["a", "b", "c"]);
        expect(console.warn).not.toHaveBeenCalled();
      });

      it("raises a warning if _properties entry references a function that throws", function() {
        tabris.TestType._properties.knownProperty = "boolean";
        spyOn(tabris.PropertyEncoding, "boolean").and.throwError("My Error");

        proxy.set("knownProperty", true);

        var message = "TestType: Unsupported value for property \"knownProperty\": My Error";
        expect(console.warn).toHaveBeenCalledWith(message);
      });

      it("raises a warning if _setProperty is a function that throws", function() {
        tabris.TestType._setProperty.knownProperty = function() {
          throw new Error("My Error");
        };
        proxy.set("knownProperty", true);

        var message = "TestType: Failed to set property \"knownProperty\" value: My Error";
        expect(console.warn).toHaveBeenCalledWith(message);
      });

      it("still sets the value if _properties entry is a function that throws", function() {
        // TODO: This will be flipped later to ignore the incorrect value
        tabris.TestType._properties.knownProperty = function() {
          throw new Error("My Error");
        };
        proxy.set("knownProperty", "foo");

        var call = nativeBridge.calls({op: "set"})[0];
        expect(call.properties.knownProperty).toBe("foo");
      });

      it("uses _properties entry to convert the value", function() {
        tabris.TestType._properties.knownProperty = "boolean";
        spyOn(tabris.PropertyEncoding, "boolean").and.returnValue("foo");

        proxy.set("knownProperty", "bar");

        expect(tabris.PropertyEncoding.boolean).toHaveBeenCalledWith("bar");
        var call = nativeBridge.calls({op: "set"})[0];
        expect(call.properties.knownProperty).toBe("foo");
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
        tabris.TestType._listen.foo = true;
      });

      it("calls native listen (true) for first listener", function() {
        proxy.on("foo", listener);

        var call = nativeBridge.calls({op: "listen", event: "foo"})[0];
        expect(call.listen).toEqual(true);
      });

      it("only prints info for unknown event", function() {
        proxy.on("unknown", listener);

        expect(nativeBridge.calls({op: "listen", event: "unknown"}).length).toBe(0);
        var warning = "TestType: Unknown event type unknown";
        expect(console.info).toHaveBeenCalledWith(warning);
      });

      it("calls native listen with translated event name", function() {
        tabris.TestType._listen.bar = "bar2";
        proxy.on("bar", listener);

        var call = nativeBridge.calls({op: "listen"})[0];
        expect(call.event).toBe("bar2");
      });

      it("calls custom listen", function() {
        tabris.TestType._listen.bar = jasmine.createSpy();
        proxy.on("bar", listener);

        expect(tabris.TestType._listen.bar).toHaveBeenCalled();
      });

      it("calls native listen for another listener for another event", function() {
        tabris.TestType._listen.bar = true;

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
        tabris.TestType._listen.foo = true;
        proxy.on("foo", listener);
        nativeBridge.resetCalls();
      });

      it("calls native listen (false) for last listener removed", function() {
        proxy.off("foo", listener);

        var call = nativeBridge.calls({op: "listen", event: "foo"})[0];
        expect(call.listen).toBe(false);
      });

      it("calls native listen with translated event name", function() {
        tabris.TestType._listen.bar = "bar2";
        proxy.on("bar", listener);
        proxy.off("bar", listener);

        var call = nativeBridge.calls({op: "listen"})[1];
        expect(call.event).toBe("bar2");
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

      it("notifies parents remove listeners", function() {
        var listener = jasmine.createSpy();
        var parent = tabris.create("Composite").on("removechild", listener).append(proxy);

        proxy.dispose();

        var args = listener.calls.argsFor(0);
        expect(args[0]).toBe(proxy);
        expect(args[1]).toBe(parent);
        expect(args[2]).toEqual({index: 0});
      });

      it("notifies dispose listeners", function() {
        var listener = jasmine.createSpy();
        proxy.on("dispose", listener);

        proxy.dispose();

        expect(listener).toHaveBeenCalled();
        expect(listener.calls.first().args).toEqual([{}]);
      });

      it("notifies dispose listeners before native destroy", function() {
        proxy.on("dispose", function() {
          expect(nativeBridge.calls({op: "destroy"}).length).toEqual(0);
        });

        proxy.dispose();
      });

      it("notifies all children's dispose listeners", function() {
        var child1 = tabris.create("TestType", {}).appendTo(proxy);
        var child2 = tabris.create("TestType", {}).appendTo(proxy);

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

        expect(log).toEqual(["parent", "child1", "child2"]);
      });

      it("notifies children's dispose listeners recursively", function() {
        var parent = tabris.create("TestType", {});
        var child = tabris.create("TestType", {}).appendTo(parent);
        var grandchild = tabris.create("TestType", {}).appendTo(child);
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

        expect(log).toEqual(["parent", "child", "grandchild"]);
      });

      it("does not call native destroy on children", function() {
        tabris.create("TestType", {parent: proxy});

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

        expect(proxy.children().toArray()).toEqual([]);
      });

    });

  });

});
