describe("Properties", function() {
  /*globals _:false*/

  var object;

  beforeEach(function() {
    object = {};
    _.extend(object, tabris.Properties);
  });

  describe("without Events:", function() {

    it ("set returns self", function() {
      expect(object.set("foo", "bar")).toBe(object);
    });

    it ("set calls _checkDisposed", function() {
      object._checkDisposed = jasmine.createSpy();

      object.set("foo", "bar");

      expect(object._checkDisposed).toHaveBeenCalled();
    });

    it ("set stores single property", function() {
      object.set("foo", "bar");
      expect(object.get("foo")).toBe("bar");
    });

    it ("set stores multiple properties", function() {
      object.set({foo: "bar", foo2: "bar2"});
      expect(object.get("foo")).toBe("bar");
      expect(object.get("foo2")).toBe("bar2");
    });

    it ("get returns undefined for unset property", function() {
      expect(object.get("foo")).toBeUndefined();
    });

    it ("set calls _applyProperty", function() {
      object._applyProperty = jasmine.createSpy().and.returnValue(true);
      object.set("foo", "bar");

      expect(object.get("foo")).toBe("bar");
      expect(object._applyProperty).toHaveBeenCalledWith("foo", "bar", {});
    });

    it ("set calls _applyProperty with options", function() {
      object._applyProperty = jasmine.createSpy().and.returnValue(true);
      object.set("foo", "bar", {foo2: "bar2"});

      expect(object._applyProperty).toHaveBeenCalledWith("foo", "bar", {foo2: "bar2"});
    });

    it ("set does not store value if _applyProperty returns false", function() {
      object._applyProperty = function() {return false;};
      object.set("foo", "bar");

      expect(object.get("foo")).toBeUndefined();
    });

    it ("get does not call _readProperty if value is set", function() {
      object.set("foo", "bar");
      object._readProperty = jasmine.createSpy();

      expect(object.get("foo")).toBe("bar");
      expect(object._readProperty).not.toHaveBeenCalled();
    });

    it ("get calls _readProperty if value is unset", function() {
      object._readProperty = jasmine.createSpy();

      object.get("foo");

      expect(object._readProperty).toHaveBeenCalledWith("foo");
    });

    it ("get returns value returned by _readProperty", function() {
      object._readProperty = function() {return "bar2";};

      expect(object.get("foo")).toBe("bar2");
    });

  });

  describe("with Events:", function() {

    var listener;

    beforeEach(function() {
      _.extend(object, tabris.Events);
      listener = jasmine.createSpy();
    });

    it ("set triggers change event", function() {
      object.on("change:foo", listener);

      object.set("foo", "bar");

      expect(listener).toHaveBeenCalled();
      expect(listener.calls.argsFor(0)[0]).toBe(object);
      expect(listener.calls.argsFor(0)[1]).toBe("bar");
      expect(listener.calls.argsFor(0)[2]).toEqual({});
    });

    it ("set (two parameters) triggers change event with options", function() {
      object.on("change:foo", listener);

      object.set({foo: "bar"}, {foo2: "bar2"});

      expect(listener).toHaveBeenCalled();
      expect(listener.calls.argsFor(0)[0]).toBe(object);
      expect(listener.calls.argsFor(0)[1]).toBe("bar");
      expect(listener.calls.argsFor(0)[2]).toEqual({foo2: "bar2"});
    });

    it ("set (three parameters) triggers change event with options", function() {
      object.on("change:foo", listener);

      object.set("foo", "bar", {foo2: "bar2"});

      expect(listener).toHaveBeenCalled();
      expect(listener.calls.argsFor(0)[0]).toBe(object);
      expect(listener.calls.argsFor(0)[1]).toBe("bar");
      expect(listener.calls.argsFor(0)[2]).toEqual({foo2: "bar2"});
    });

    it ("set triggers no change event if value is unchanged", function() {
      object.set("foo", "bar");
      object.on("change:foo", listener);

      object.set("foo", "bar");

      expect(listener).not.toHaveBeenCalled();
    });

  });

});
