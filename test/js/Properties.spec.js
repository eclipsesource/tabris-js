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
      expect(object._applyProperty).toHaveBeenCalledWith("foo", "bar");
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

});
