describe("Proxy", function() {

  var nativeBridge;
  var log;

  beforeEach(function() {
    nativeBridge = new NativeBridgeSpy();
    log = [];
    tabris._reset();
    tabris._init(nativeBridge);
    tabris.registerWidget("TestType", {
      _supportsChildren: true,
      _properties: {foo: "any"},
      _events: {bar: true}
    });
  });

  afterEach(function() {
    delete tabris.TestType;
    delete tabris.CustomType;
  });

  describe("create", function() {

    var proxy;

    beforeEach(function() {
      proxy = tabris.create("TestType");
      nativeBridge.resetCalls();
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
      tabris.TestType._properties.foo.type = "proxy";

      proxy._create({foo: other});

      var properties = nativeBridge.calls({op: "create", type: "TestType"})[0].properties;
      expect(properties.foo).toBe("other-id");
    });

    it("sends native set for init properties", function() {
      tabris.registerType("CustomType", {
        _initProperties: {foo: 23},
        _properties: {bar: true}
      });

      tabris.create("CustomType", {bar: 42});

      var properties = nativeBridge.calls({op: "create", type: "CustomType"})[0].properties;
      expect(properties).toEqual({foo: 23, bar: 42});
    });

    it("does not raise warning for init properties", function() {
      tabris.registerType("CustomType", {_initProperties: {foo: 23}});
      spyOn(console, "warn");

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

    it("isDisposed() returns false", function() {
      expect(proxy.isDisposed()).toBe(false);
    });

    describe("calling append with a proxy", function() {
      var child, result, listener;

      beforeEach(function() {
        listener = jasmine.createSpy();
        child = tabris.create("TextView", {});
        nativeBridge.resetCalls();
        proxy.on("addchild", listener);
        result = proxy.append(child);
      });

      it("sets the child's parent", function() {
        var calls = nativeBridge.calls();
        expect(calls.length).toBe(1);
        expect(calls[0]).toEqual({op: "set", id: child.cid, properties: {parent: proxy.cid}});
      });

      it("returns self to allow chaining", function() {
        expect(result).toBe(proxy);
      });

      it("notifies add listeners with arguments parent, child, event", function() {
        var args = listener.calls.argsFor(0);
        expect(args[0]).toBe(proxy);
        expect(args[1]).toBe(child);
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
        child1 = tabris.create("TextView", {});
        child2 = tabris.create("Button", {});
        nativeBridge.resetCalls();
        result = proxy.append(child1, child2);
      });

      it("sets the children's parent", function() {
        var calls = nativeBridge.calls();
        expect(calls.length).toBe(2);
        expect(calls[1]).toEqual({op: "set", id: child2.cid, properties: {parent: proxy.cid}});
      });

      it("returns self to allow chaining", function() {
        expect(result).toBe(proxy);
      });

      it("children() contains appended children", function() {
        expect(proxy.children()).toContain(child1);
        expect(proxy.children()).toContain(child2);
      });

      it("children() with matcher contains filtered children", function() {
        expect(proxy.children("TextView").toArray()).toEqual([child1]);
        expect(proxy.children("Button").toArray()).toEqual([child2]);
      });

    });

    describe("append with proxy collection", function() {
      var child1, child2, result;

      beforeEach(function() {
        child1 = tabris.create("TextView", {});
        child2 = tabris.create("TextView", {});
        nativeBridge.resetCalls();
        result = proxy.append(new tabris.ProxyCollection([child1, child2]));
      });

      it("sets the children's parent", function() {
        var calls = nativeBridge.calls();
        expect(calls.length).toBe(2);
        expect(calls[1]).toEqual({op: "set", id: child2.cid, properties: {parent: proxy.cid}});
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
        var child = tabris.create("TextView", {});

        expect(function() {
          proxy.append(child);
        }).toThrowError("TestType cannot contain children");
        expect(proxy.children()).not.toContain(child);
      });

    });

    describe("append children of unsupported type", function() {

      it("logs an error", function() {
        tabris.TestType._supportsChildren = function() { return false; };
        var child = tabris.create("TextView", {});

        expect(function() {
          proxy.append(child);
        }).toThrowError("TestType cannot contain children of type TextView");
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
        var setCall = nativeBridge.calls({op: "set", id: proxy.cid})[0];
        expect(setCall.properties.parent).toEqual(parent1.cid);
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

      it("does not call native get for unknown properties", function() {
        proxy.get("bar");

        expect(nativeBridge.calls({op: "get"}).length).toBe(0);
      });

      it("calls native get", function() {
        proxy.get("foo");

        expect(nativeBridge.calls({op: "get", property: "foo"}).length).toBe(1);
      });

      it("returns uncached value from native", function() {
        spyOn(nativeBridge, "get").and.returnValue(23);

        var result = proxy.get("foo");

        expect(result).toBe(23);
      });

      it("returns uncached value from default config", function() {
        tabris.TestType._properties.foo.default = 23;

        var result = proxy.get("foo");

        expect(result).toBe(23);
      });

      it("returns cloned value from default function", function() {
        tabris.TestType._properties.foo.default = function() {return [];};

        proxy.get("foo").push(1);

        expect(proxy.get("foo")).toEqual([]);
      });

      it("returns cached value", function() {
        proxy.set("foo", "bar");
        spyOn(nativeBridge, "get");

        var result = proxy.get("foo");

        expect(nativeBridge.get).not.toHaveBeenCalled();
        expect(result).toBe("bar");
      });

      it("returns cached value decoded", function() {
        tabris.TestType._properties.foo.type = "color";
        proxy.set("foo", "#ff00ff");

        var result = proxy.get("foo");

        expect(result).toBe("rgba(255, 0, 255, 1)");
      });

      it("calls custom get function with property name", function() {
        tabris.TestType._properties.prop = {type: "any", get: jasmine.createSpy()};

        proxy.get("prop");

        expect(tabris.TestType._properties.prop.get).toHaveBeenCalledWith("prop");
      });

      it("returns value from custom get function", function() {
        tabris.TestType._properties.prop = {type: "any", get: function() { return 23; }};

        var result = proxy.get("prop");

        expect(result).toBe(23);
      });

      it("raises no warning for unknown property", function() {
        spyOn(console, "warn");

        proxy.get("unknownProperty", true);

        expect(console.warn).not.toHaveBeenCalled();
      });

      it("calls function if _propertyCheck is a string found in PropertyDecoding", function() {
        tabris.TestType._properties.foo.type = "color";
        spyOn(nativeBridge, "get").and.returnValue(23);
        spyOn(tabris.PropertyDecoding, "color").and.returnValue("bar");
        spyOn(console, "warn");

        var result = proxy.get("foo");

        expect(result).toBe("bar");
        expect(tabris.PropertyDecoding.color).toHaveBeenCalledWith(23);
        expect(console.warn).not.toHaveBeenCalled();
      });

      it("calls function if _propertyCheck is an array", function() {
        tabris.TestType._properties.foo.type = ["color", 1, 2, 3];
        spyOn(nativeBridge, "get").and.returnValue(23);
        spyOn(tabris.PropertyDecoding, "color").and.returnValue("bar");
        spyOn(console, "warn");

        var result = proxy.get("foo");

        expect(result).toBe("bar");
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
        tabris.TestType._properties.foo.type = "proxy";

        proxy.set("foo", other);

        var call = nativeBridge.calls({op: "set", id: proxy.cid})[0];
        expect(call.properties.foo).toBe("other-id");
      });

      it("translates widget collection to first ids in properties", function() {
        var other = new tabris.ProxyCollection([new tabris.Proxy("other-id")]);
        tabris.TestType._properties.foo.type = "proxy";

        proxy.set("foo", other);

        var call = nativeBridge.calls({op: "set", id: proxy.cid})[0];
        expect(call.properties.foo).toBe("other-id");
      });

      it("does not translate objects with id field to ids", function() {
        var obj = {id: "23", name: "bar"};
        tabris.TestType._properties.foo.type = "proxy";

        proxy.set("foo", obj);

        var properties = nativeBridge.calls({op: "set", id: proxy.cid})[0].properties;
        expect(properties.foo).toEqual(obj);
      });

      it("translation does not modify properties", function() {
        var other = new tabris.Proxy("other-id");
        var properties = {foo: other};

        proxy.set(properties);

        expect(properties.foo).toBe(other);
      });

      it("uses custom set function", function() {
        tabris.TestType._properties.foo = {type: "any", set: jasmine.createSpy()};
        var options = {option: "myOption"};

        proxy.set("foo", "bar", options);

        expect(nativeBridge.calls({op: "set", id: proxy.cid}).length).toBe(0);
        expect(tabris.TestType._properties.foo.set).toHaveBeenCalledWith("foo", "bar", options);
      });

      it("raises no warning for unknown property", function() {
        spyOn(console, "warn");

        proxy.set("unknownProperty", true);

        expect(console.warn).not.toHaveBeenCalled();
      });

      it("stores unknown property loacally", function() {
        proxy.set("unknownProperty", "foo");

        expect(nativeBridge.calls({op: "set", id: proxy.cid}).length).toBe(0);
        expect(proxy.get("unknownProperty")).toBe("foo");
      });

      it("do not SET the value if _properties entry references a function that throws", function() {
        tabris.TestType._properties.knownProperty = {type: "boolean"};
        spyOn(tabris.PropertyEncoding, "boolean").and.throwError("My Error");

        proxy.set("knownProperty", "foo");

        expect(nativeBridge.calls({op: "set"}).length).toBe(0);
      });

      it("raises a warning if setter is a function that throws", function() {
        tabris.TestType._properties.foo = {type: "any", set: function() {
          throw new Error("My Error");
        }};
        spyOn(console, "warn");

        expect(function() {
          proxy.set("foo", true);
        }).toThrow();
        expect(console.warn).not.toHaveBeenCalled();
      });

      it("uses _properties entry to convert the value", function() {
        tabris.TestType._properties.foo.type = "boolean";
        spyOn(tabris.PropertyEncoding, "boolean").and.returnValue("bar2");

        proxy.set("foo", "bar");

        expect(tabris.PropertyEncoding.boolean).toHaveBeenCalledWith("bar");
        var call = nativeBridge.calls({op: "set"})[0];
        expect(call.properties.foo).toBe("bar2");
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

      it ("triggers change event for known properties", function() {
        tabris.TestType._properties.foo = {type: "any", default: ""};
        var listener = jasmine.createSpy();
        proxy.on("change:foo", listener);

        proxy.set("foo", "bar");

        expect(listener).toHaveBeenCalled();
        expect(listener.calls.argsFor(0)[0]).toBe(proxy);
        expect(listener.calls.argsFor(0)[1]).toBe("bar");
        expect(listener.calls.argsFor(0)[2]).toEqual({});
      });

      it ("triggers change event for known properties with options object", function() {
        tabris.TestType._properties.foo = {type: "any", default: ""};
        var listener = jasmine.createSpy();
        proxy.on("change:foo", listener);

        proxy.set("foo", "bar", {foo2: "bar2"});

        expect(listener).toHaveBeenCalled();
        expect(listener.calls.argsFor(0)[0]).toBe(proxy);
        expect(listener.calls.argsFor(0)[1]).toBe("bar");
        expect(listener.calls.argsFor(0)[2]).toEqual({foo2: "bar2"});
      });

      it ("triggers change event with decoded property value", function() {
        tabris.TestType._properties.foo = {type: "color"};
        var listener = jasmine.createSpy();
        proxy.on("change:foo", listener);

        proxy.set("foo", "#ff00ff");

        expect(listener.calls.argsFor(0)[1]).toBe("rgba(255, 0, 255, 1)");
      });

      it ("triggers no change event if value is unchanged from default", function() {
        tabris.TestType._properties.foo = {type: "any", default: ""};
        var listener = jasmine.createSpy();
        proxy.on("change:foo", listener);

        proxy.set("foo", "");

        expect(listener).not.toHaveBeenCalled();

      });

      it ("triggers no change event if value is unchanged from previous value", function() {
        tabris.TestType._properties.foo = {type: "any", default: ""};
        var listener = jasmine.createSpy();
        proxy.set("foo", "bar");
        proxy.on("change:foo", listener);

        proxy.set("foo", "bar");

        expect(listener).not.toHaveBeenCalled();
      });

      it ("always triggers initial change event for cached properties without default", function() {
        tabris.TestType._properties.foo = {type: "any"};
        var listener = jasmine.createSpy();
        proxy.on("change:foo", listener);

        proxy.set("foo", "bar");
        proxy.set("foo", "bar");

        expect(listener.calls.count()).toBe(1);
      });

    });

    describe("_nativeCall", function() {

      it("calls native call", function() {
        proxy._nativeCall("method", {foo: 23});

        var call = nativeBridge.calls()[0];
        expect(call.op).toEqual("call");
        expect(call.method).toEqual("method");
        expect(call.parameters).toEqual({foo: 23});
      });

      it("returns value from native", function() {
        spyOn(nativeBridge, "call").and.returnValue(23);

        var result = proxy._nativeCall("method", {});

        expect(result).toBe(23);
      });

      it("fails on disposed object", function() {
        proxy.dispose();

        expect(function() {
          proxy._nativeCall("foo", {});
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
        proxy.on("bar", listener);

        var call = nativeBridge.calls({op: "listen", event: "bar"})[0];
        expect(call.listen).toEqual(true);
      });

      it("calls native listen with translated event name", function() {
        tabris.registerType("CustomType", {_events: {foo: "bar"}});
        proxy = tabris.create("CustomType");
        proxy.on("foo", listener);

        var call = nativeBridge.calls({op: "listen"})[0];
        expect(call.event).toBe("bar");
        delete tabris.CustomType;
      });

      it("calls native listen (true) for first alias listener", function() {
        tabris.registerType("CustomType", {_events: {foo: {name: "bar", alias: "foo1"}}});
        proxy = tabris.create("CustomType");

        proxy.on("foo1", listener);

        var call = nativeBridge.calls({op: "listen", event: "bar"})[0];
        expect(call.listen).toEqual(true);
      });

      it("calls custom listen", function() {
        tabris.TestType._events.bar.listen = jasmine.createSpy();

        proxy.on("bar", listener);

        expect(tabris.TestType._events.bar.listen).toHaveBeenCalledWith(true, false);
      });

      it("calls custom listen with alias flag", function() {
        tabris.registerType("CustomType", {
          _events: {foo: {alias: "foo1", listen: jasmine.createSpy()}}
        });
        proxy = tabris.create("CustomType");

        proxy.on("foo1", listener);

        expect(tabris.CustomType._events.foo.listen).toHaveBeenCalledWith(true, true);
      });

      it("calls native listen for another listener for another event", function() {
        tabris.TestType._events.bar = {name: "bar"};

        proxy.on("foo", listener);
        proxy.on("bar", listener);

        var call = nativeBridge.calls({op: "listen", event: "bar"})[0];
        expect(call.listen).toEqual(true);
      });

      it("does not call native listen for subsequent listeners for the same event", function() {
        proxy.on("bar", listener);
        proxy.on("bar", listener);

        expect(nativeBridge.calls({op: "listen"}).length).toBe(1);
      });

      it("does not call native listen for subsequent listeners for alias event", function() {
        tabris.registerType("CustomType", {_events: {foo: {alias: "bar"}}});
        proxy = tabris.create("CustomType");
        proxy.on("foo", listener);
        proxy.on("bar", listener);

        expect(nativeBridge.calls({op: "listen"}).length).toBe(1);
      });

      it("does not call native listen for subsequent listeners for aliased event", function() {
        tabris.registerType("CustomType", {_events: {foo: {alias: "bar"}}});
        proxy = tabris.create("CustomType");
        proxy.on("bar", listener);
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
        proxy.on("bar", listener);
        nativeBridge.resetCalls();
      });

      it("calls native listen (false) for last listener removed", function() {
        proxy.off("bar", listener);

        var call = nativeBridge.calls({op: "listen", event: "bar"})[0];
        expect(call.listen).toBe(false);
      });

      it("calls native listen (false) for last alias listener removed", function() {
        tabris.registerType("CustomType", {_events: {foo: {alias: "bar"}}});
        proxy = tabris.create("CustomType");
        proxy.on("bar", listener);

        proxy.off("bar", listener);

        var call = nativeBridge.calls({op: "listen", event: "foo"})[1];
        expect(call.listen).toBe(false);
      });

      it("calls native listen with translated event name", function() {
        tabris.registerType("CustomType", {_events: {foo: "bar"}});
        proxy = tabris.create("CustomType");
        proxy.on("foo", listener);
        proxy.off("foo", listener);

        var call = nativeBridge.calls({op: "listen"})[1];
        expect(call.event).toBe("bar");
        delete tabris.CustomType;
      });

      it("does not call native listen when other listeners exist for same event", function() {
        proxy.on("bar", listener2);
        proxy.off("bar", listener);

        expect(nativeBridge.calls().length).toBe(0);
      });

      it("does not call native listen when other listeners exist for alias event", function() {
        tabris.registerType("CustomType", {_events: {foo: {alias: "bar"}}});
        proxy = tabris.create("CustomType");
        proxy.on("foo", listener);
        proxy.on("bar", listener);
        nativeBridge.resetCalls();

        proxy.off("foo", listener);

        expect(nativeBridge.calls().length).toBe(0);
      });

      it("does not call native listen when other listeners exist for aliased event", function() {
        tabris.registerType("CustomType", {_events: {foo: {alias: "bar"}}});
        proxy = tabris.create("CustomType");
        proxy.on("foo", listener);
        proxy.on("bar", listener);
        nativeBridge.resetCalls();

        proxy.off("bar", listener);

        expect(nativeBridge.calls().length).toBe(0);
      });

      it("calls native listen when not other listeners exist for aliased or alias event", function() {
        tabris.registerType("CustomType", {_events: {foo: {alias: "bar"}}});
        proxy = tabris.create("CustomType");
        proxy.on("foo", listener);
        proxy.on("bar", listener);
        nativeBridge.resetCalls();

        proxy.off("bar", listener);
        proxy.off("foo", listener);

        expect(nativeBridge.calls().length).toBe(1);
      });

      it("calls native listen when not other listeners exist for aliased or alias event (reversed off)", function() {
        tabris.registerType("CustomType", {_events: {foo: {alias: "bar"}}});
        proxy = tabris.create("CustomType");
        proxy.on("foo", listener);
        proxy.on("bar", listener);
        nativeBridge.resetCalls();

        proxy.off("foo", listener);
        proxy.off("bar", listener);

        expect(nativeBridge.calls().length).toBe(1);
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

        var destroyCall = nativeBridge.calls({op: "destroy", id: proxy.cid})[0];
        expect(destroyCall).toBeDefined();
      });

      it("notifies dispose listeners", function() {
        var listener = jasmine.createSpy();
        proxy.on("dispose", listener);

        proxy.dispose();

        expect(listener).toHaveBeenCalled();
        expect(listener.calls.first().args[0]).toBe(proxy);
        expect(listener.calls.first().args[1]).toEqual({});
      });

      it("notifies dispose listeners before native destroy", function() {
        proxy.on("dispose", function() {
          expect(nativeBridge.calls({op: "destroy"}).length).toEqual(0);
        });

        proxy.dispose();
      });

      it("does not call native destroy twice when called twice", function() {
        proxy.dispose();
        proxy.dispose();

        expect(nativeBridge.calls({op: "destroy"}).length).toBe(1);
      });

      it("can be called from within a dispose listener", function() {
        proxy.on("dispose", function() {
          proxy.dispose();
        });

        expect(function() {
          proxy.dispose();
        }).not.toThrow();
      });

    });

    describe("when disposed", function() {
      beforeEach(function() {
        proxy.dispose();
      });

      it("isDisposed returns true", function() {
        expect(proxy.isDisposed()).toBe(true);
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

    });

    describe("with children", function() {

      var child1, child2, child1_1, child1_2, child1_2_1;

      beforeEach(function() {
        tabris.registerWidget("TestType2", {
          _supportsChildren: true
        });
        child1 = tabris.create("TestType2", {id: "foo", class: "myclass"}).appendTo(proxy);
        child2 = tabris.create("TestType", {id: "bar"}).appendTo(proxy);
        child1_1 = tabris.create("TestType", {}).appendTo(child1);
      });

      afterEach(function() {
        delete tabris.TestType2;
      });

      describe("find", function() {

        beforeEach(function() {
          child1_1.set({class: "bar"});
          child1_2 = tabris.create("TestType", {class: "bar"}).appendTo(child1);
          child1_2_1 = tabris.create("TestType", {id: "foo", class: "bar2"}).appendTo(child1_2);
        });

        it("* selector returns all descendants", function() {
          expect(proxy.find("*").toArray()).toEqual([child1, child1_1, child1_2, child1_2_1, child2]);
        });

        it("# selector returns all descendants with given id", function() {
          expect(proxy.find("#foo").toArray()).toEqual([child1, child1_2_1]);
        });

        it(". selector returns all descendants with given class", function() {
          expect(proxy.find(".bar").toArray()).toEqual([child1_1, child1_2]);
        });

      });

      describe("apply", function() {

        var targets;

        beforeEach(function() {
          targets = [proxy, child1, child2, child1_1];
          targets.forEach(function(target) {
            target.set = jasmine.createSpy();
          });
        });

        it("returns self", function() {
          expect(proxy.apply({})).toBe(proxy);
        });

        it("applies properties to all children", function() {
          var props = {prop1: "v1", prop2: "v2"};
          proxy.apply({"*": props});

          expect(proxy.set).toHaveBeenCalledWith(props);
          expect(child1.set).toHaveBeenCalledWith(props);
          expect(child2.set).toHaveBeenCalledWith(props);
          expect(child1_1.set).toHaveBeenCalledWith(props);
        });

        it("applies properties to children with specific id", function() {
          proxy.apply({"#foo": {prop1: "v1"}, "#bar": {prop2: "v2"}});

          expect(proxy.set).not.toHaveBeenCalled();
          expect(child1.set).toHaveBeenCalledWith({prop1: "v1"});
          expect(child2.set).toHaveBeenCalledWith({prop2: "v2"});
          expect(child1_1.set).not.toHaveBeenCalled();
        });

        it("applies properties to children with specific type", function() {
          proxy.apply({"TestType2": {prop1: "v1"}});

          expect(proxy.set).not.toHaveBeenCalled();
          expect(child1.set).toHaveBeenCalledWith({prop1: "v1"});
          expect(child2.set).not.toHaveBeenCalled();
          expect(child1_1.set).not.toHaveBeenCalled();
        });

        it("applies properties in order *, Type, class, id", function() {
          proxy.apply({
            "#foo": {prop1: "v4"},
            ".myclass": {prop1: "v3"},
            "TestType2": {prop1: "v2"},
            "*": {prop1: "v1"}
          });

          expect(child1.set.calls.allArgs()).toEqual([
            [{prop1: "v1"}],
            [{prop1: "v2"}],
            [{prop1: "v3"}],
            [{prop1: "v4"}]
          ]);
        });

      });

    });

  });

});
