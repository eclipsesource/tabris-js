describe("tabris", function() {

  var nativeBridge;
  var log;

  beforeEach(function() {
    nativeBridge = new NativeBridgeSpy();
    log = [];
    tabris._reset();
    tabris._init(nativeBridge);
    tabris.TestType = tabris.Proxy.extend({_name: "TestType", _properties: {foo: "any"}});
  });

  afterEach(function() {
    delete tabris.TestType;
  });

  describe("_init", function() {

    it("can be called without a context", function() {
      expect(() => {
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
        new tabris.TestType();
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
      tabris.CustomType = tabris.Proxy.extend({_events: {bar: true}});
      proxy = new tabris.CustomType();
      spyOn(proxy, "trigger");

      tabris._notify(proxy.cid, "bar", {bar: 23});

      expect(proxy.trigger).toHaveBeenCalledWith("bar", {bar: 23});
    });

    it("notifies widget proxy with translated event name", function() {
      tabris.CustomType = tabris.Proxy.extend({_events: {bar: "foo"}});
      proxy = new tabris.CustomType();
      spyOn(proxy, "trigger");

      tabris._notify(proxy.cid, "foo", {});

      expect(proxy.trigger).toHaveBeenCalledWith("bar", {});
    });

    it("calls custom trigger", function() {
      tabris.CustomType = tabris.Proxy.extend({

        _events: {
          bar: {
            trigger: jasmine.createSpy()
          }
        }
      });
      proxy = new tabris.CustomType();
      spyOn(proxy, "trigger");

      tabris._notify(proxy.cid, "bar", {bar: 23});

      expect(tabris.CustomType._events.bar.trigger).toHaveBeenCalledWith({bar: 23}, "bar");
    });

    it("returns return value from custom trigger", function() {
      tabris.CustomType = tabris.Proxy.extend({

        _events: {
          bar: {
            trigger: jasmine.createSpy().and.returnValue("foo")
          }
        }
      });
      proxy = new tabris.CustomType();
      spyOn(proxy, "trigger");

      var returnValue = tabris._notify(proxy.cid, "bar");

      expect(returnValue).toBe("foo");
    });

    it("calls custom trigger of translated event", function() {
      tabris.CustomType = tabris.Proxy.extend({

        _events: {
          bar: {
            name: "foo",
            trigger: jasmine.createSpy()
          }
        }
      });
      proxy = new tabris.CustomType();
      spyOn(proxy, "trigger");

      tabris._notify(proxy.cid, "foo", {bar: 23});

      expect(tabris.CustomType._events.bar.trigger).toHaveBeenCalledWith({bar: 23}, "bar");
    });

    it("returns return value from custom trigger with translated event", function() {
      tabris.CustomType = tabris.Proxy.extend({

        _events: {
          bar: {
            name: "foo",
            trigger: jasmine.createSpy().and.returnValue("foobar")
          }
        }
      });
      proxy = new tabris.CustomType();
      spyOn(proxy, "trigger");

      var returnValue = tabris._notify(proxy.cid, "foo");

      expect(returnValue).toBe("foobar");
    });

    it("skips events for already disposed widgets", function() {
      tabris.CustomType = tabris.Proxy.extend({_events: {bar: true}});
      proxy = new tabris.CustomType();
      proxy.dispose();
      spyOn(proxy, "trigger");

      tabris._notify(proxy.cid, "bar", {bar: 23});

      expect(proxy.trigger).not.toHaveBeenCalled();
    });

    it("silently ignores events for non-existing ids (does not crash)", function() {
      expect(() => {
        tabris._notify("no-id", "foo", [23, 42]);
      }).not.toThrow();
    });

    it("can be called without a context", function() {
      tabris.CustomType = tabris.Proxy.extend({_events: {bar: true}});
      proxy = new tabris.CustomType();
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

});
