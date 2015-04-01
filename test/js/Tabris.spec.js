describe("tabris", function() {

  var nativeBridge;
  var log;

  beforeEach(function() {
    nativeBridge = new NativeBridgeSpy();
    log = [];
    tabris._reset();
    tabris._init(nativeBridge);
    tabris.registerType("TestType", {_properties: {foo: true}});
  });

  afterEach(function() {
    delete tabris.TestType;
  });

  it("exports tabris object", function() {
    expect(module.exports).toBe(tabris);
  });

  describe("when used as a function", function() {

    it("returns a proxy with the given string as id and type", function() {
      var result = tabris("TestType");

      expect(result).toEqual(jasmine.any(tabris.TestType));
      expect(result.cid).toBe("TestType");
    });

    it("returns a proxy with translated type", function() {
      tabris.registerType("_TestType", {_type: "tabris.TestType"});

      var result = tabris("_TestType");

      expect(result).toEqual(jasmine.any(tabris._TestType));
      expect(result.cid).toBe("tabris.TestType");
      delete tabris._TestType;
    });

    it("makes proxy with translated type notifiable", function() {
      tabris.registerType("_TestType", {_type: "tabris.TestType"});
      var result = tabris("_TestType");
      var listener = jasmine.createSpy();
      result.on("foo", listener);

      tabris._notify("tabris.TestType", "foo");

      expect(listener).toHaveBeenCalled();
      delete tabris._TestType;
    });

    it("returns same proxy instance for the same id", function() {
      tabris.TestType._type = "CustomType";
      var result1 = tabris("TestType");
      var result2 = tabris("TestType");

      expect(result1).toBe(result2);
    });

    it("returns same proxy instance for the same translated id", function() {
      var result1 = tabris("TestType");
      var result2 = tabris("TestType");

      expect(result1).toBe(result2);
    });

    it("does not call create on native bridge", function() {
      tabris("TestType");

      expect(nativeBridge.calls().length).toBe(0);
    });

    it("fails for unknown types", function() {
      expect(function() {
        tabris("foo");
      }).toThrow();
    });

  });

  describe("_init", function() {

    it("can be called without a context", function() {
      expect(function() {
        tabris._init.call(null, nativeBridge);
      }).not.toThrow();
    });

    it("executes all load functions", function() {
      tabris.load(function() {
        log.push("foo");
      });
      tabris.load(function() {
        log.push("bar");
      });

      tabris._init.call(null, nativeBridge);

      expect(log).toEqual(["foo", "bar"]);
    });

    it("load functions can access tabris functions", function() {
      tabris._ready = false;
      tabris.load(function() {
        tabris.create("TestType");
      });

      tabris._init.call(null, nativeBridge);

      expect(nativeBridge.calls({op: "create", type: "TestType"}).length).toBe(1);
    });

  });

  describe("_notify", function() {

    var proxy;

    afterEach(function() {
      delete tabris.CustomType;
    });

    it("notifies widget proxy", function() {
      tabris.registerType("CustomType", {_events: {bar: true}});
      proxy = tabris.create("CustomType", {});
      spyOn(proxy, "trigger");

      tabris._notify(proxy.cid, "bar", {bar: 23});

      expect(proxy.trigger).toHaveBeenCalledWith("bar", {bar: 23});
    });

    it("notifies widget proxy with translated event name", function() {
      tabris.registerType("CustomType", {_events: {bar: "foo"}});
      proxy = tabris.create("CustomType", {});
      spyOn(proxy, "trigger");

      tabris._notify(proxy.cid, "foo", {});

      expect(proxy.trigger).toHaveBeenCalledWith("bar", {});
    });

    it("calls custom trigger", function() {
      tabris.registerType("CustomType", {
        _events: {
          bar: {
            trigger: jasmine.createSpy()
          }
        }
      });
      proxy = tabris.create("CustomType", {});
      spyOn(proxy, "trigger");

      tabris._notify(proxy.cid, "bar", {bar: 23});

      expect(tabris.CustomType._events.bar.trigger).toHaveBeenCalledWith({bar: 23});
    });

    it("calls custom trigger of translated event", function() {
      tabris.registerType("CustomType", {
        _events: {
          bar: {
            name: "foo",
            trigger: jasmine.createSpy()
          }
        }
      });
      proxy = tabris.create("CustomType", {});
      spyOn(proxy, "trigger");

      tabris._notify(proxy.cid, "foo", {bar: 23});

      expect(tabris.CustomType._events.bar.trigger).toHaveBeenCalledWith({bar: 23});
    });

    it("skips events for already disposed widgets", function() {
      tabris.registerType("CustomType", {_events: {bar: true}});
      proxy = tabris.create("CustomType", {});
      proxy.dispose();
      spyOn(proxy, "trigger");

      tabris._notify(proxy.cid, "bar", {bar: 23});

      expect(proxy.trigger).not.toHaveBeenCalled();
    });

    it("silently ignores events for non-existing ids (does not crash)", function() {
      expect(function() {
        tabris._notify("no-id", "foo", [23, 42]);
      }).not.toThrow();
    });

    it("can be called without a context", function() {
      tabris.registerType("CustomType", {_events: {bar: true}});
      proxy = tabris.create("CustomType", {});
      spyOn(proxy, "trigger");

      tabris._notify.call(null, proxy.cid, "bar", [23, 42]);

      expect(proxy.trigger).toHaveBeenCalledWith("bar", [23, 42]);
    });

  });

  describe("load", function() {

    beforeEach(function() {
      delete tabris._nativeBridge;
      tabris._ready = false;
    });

    it("function is not executed before start time", function() {
      var fn = jasmine.createSpy();
      tabris.load(fn);

      expect(fn).not.toHaveBeenCalled();
    });

    it("function is executed at start time", function() {
      var fn = jasmine.createSpy();

      tabris.load(fn);
      tabris._init(nativeBridge);

      expect(fn).toHaveBeenCalled();
    });

    it("nested load functions are executed at the end", function() {
      var log = [];

      tabris.load(function() {
        log.push("1");
        tabris.load(function() {
          log.push("1a");
        });
        tabris.load(function() {
          log.push("1b");
        });
      });
      tabris.load(function() {
        log.push("2");
      });
      tabris._init(nativeBridge);

      expect(log).toEqual(["1", "2", "1a", "1b"]);
    });

    it("runs immediately if already started", function() {
      var fn = jasmine.createSpy();

      tabris._init(nativeBridge);
      tabris.load(fn);

      expect(fn).toHaveBeenCalled();
    });

  });

  describe("create", function() {

    it("fails if tabris.js not yet started", function() {
      tabris._ready = false;
      delete tabris._nativeBridge;

      expect(function() {
        tabris.create("TestType", {});
      }).toThrowError("tabris.js not started");
    });

    it("fails if type is unknown", function() {
      expect(function() {
        tabris.create("UnknownType", {});
      }).toThrowError("Unknown type UnknownType");
    });

    it("creates a non-empty widget id", function() {
      var proxy = tabris.create("TestType", {});

      expect(typeof proxy.cid).toBe("string");
      expect(proxy.cid.length).toBeGreaterThan(0);
    });

    it("creates different widget ids for subsequent calls", function() {
      var proxy1 = tabris.create("TestType", {});
      var proxy2 = tabris.create("TestType", {});

      expect(proxy1.cid).not.toEqual(proxy2.cid);
    });

    it("returns a proxy object", function() {
      var result = tabris.create("TestType", {});

      expect(result).toEqual(jasmine.any(tabris.Proxy));
    });

    it("prints a warning if given type is an alias", function() {
      tabris.Alias = tabris.TestType;
      spyOn(console, "warn");

      var result = tabris.create("Alias", {});

      expect(result.type).toBe("TestType");
      expect(console.warn).toHaveBeenCalledWith("\"Alias\" is deprecated, use \"TestType\"");
    });

    it("triggers a create operation with type and properties", function() {
      tabris.TestType._properties.foo = {type: true};
      var proxy = tabris.create("TestType", {foo: 23});

      var createCall = nativeBridge.calls({op: "create", id: proxy.cid})[0];

      expect(createCall.type).toBe("TestType");
      expect(createCall.properties.foo).toBe(23);
    });

    it("executes type translations", function() {
      var proxy = tabris.create("CheckBox", {});

      var createCall = nativeBridge.calls({op: "create", id: proxy.cid})[0];

      expect(createCall.type).toBe("rwt.widgets.Button");
    });

  });

  describe("register types", function() {

    afterEach(function() {
      delete tabris.CustomType;
    });

    it("allows to register a new type", function() {
      var members = {foo: 23};
      tabris.registerType("CustomType", members);
      var instance = tabris.create("CustomType");
      expect(instance).toEqual(jasmine.any(tabris.Proxy));
      expect(instance).toEqual(jasmine.any(tabris.CustomType));
    });

    it("adds members to new type", function() {
      var members = {foo: 23};
      tabris.registerType("CustomType", members);
      var instance = tabris.create("CustomType");
      expect(instance.foo).toBe(23);
      expect(instance.type).toBe("CustomType");
    });

    it("calls 'create' with type", function() {
      tabris.registerType("CustomType", {});
      tabris.create("CustomType");

      expect(nativeBridge.calls({op: "create"})[0].type).toBe("CustomType");
    });

    it("calls 'create' with _type if present", function() {
      tabris.registerType("CustomType", {_type: "foo.Type"});
      tabris.create("CustomType");

      expect(nativeBridge.calls({op: "create"})[0].type).toBe("foo.Type");
    });

    it("prevents to overwrite already registered types", function() {
      expect(function() {
        tabris.registerType("Button", {});
      }).toThrowError("Type already registered: Button");
    });

    it("adds empty trigger map to constructor", function() {
      tabris.registerType("CustomType", {});
      var instance = tabris.create("CustomType");

      expect(instance.constructor._trigger).toEqual({});
    });

    it("adds _events to constructor", function() {
      tabris.registerType("CustomType", {_events: {foo: "bar"}});
      var instance = tabris.create("CustomType");

      expect(instance.constructor._events.foo).toEqual({name: "bar"});
      expect(instance._events).toBe(tabris.Proxy.prototype._events);
    });

    it("adds normalized _events to constructor", function() {
      tabris.registerType("CustomType", {_events: {foo: "bar", foo2: {alias: "foo3"}}});
      var instance = tabris.create("CustomType");

      expect(instance.constructor._events.foo).toEqual({name: "bar"});
      expect(instance.constructor._events.foo2).toEqual({name: "foo2", alias: "foo3", originalName: "foo2"});
      expect(instance.constructor._events.foo3).toBe(instance.constructor._events.foo2);
      expect(instance._events).not.toBe(instance.constructor._events);
    });

    it("adds empty events map to constructor", function() {
      tabris.registerType("CustomType", {});
      var instance = tabris.create("CustomType");

      expect(instance.constructor._events).toEqual({});
    });

    it("adds _properties to constructor", function() {
      tabris.registerType("CustomType", {_properties: {foo: {type: "bar"}}});
      var instance = tabris.create("CustomType");

      expect(instance.constructor._properties.foo.type).toBe("bar");
    });

    it("adds normalized _properties to constructor", function() {
      tabris.registerType("CustomType", {_properties: {foo: "bar"}});
      var instance = tabris.create("CustomType");

      expect(instance.constructor._properties.foo.type).toBe("bar");
    });

    it("adds empty properties map to constructor", function() {
      tabris.registerType("CustomType", {});
      var instance = tabris.create("CustomType");

      expect(instance.constructor._properties).toEqual({});
    });

    it("adds _type to constructor", function() {
      tabris.registerType("CustomType", {_type: "foo"});
      var instance = tabris.create("CustomType");

      expect(instance.constructor._type).toBe("foo");
      expect(instance._type).toBeUndefined();
    });

  });

});
