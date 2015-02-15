describe("ProxyCollection", function() {

  var counter = 0;
  var mockProxy = function() {
    var mock = jasmine.createSpyObj("Proxy",
      ["set", "get", "append", "appendTo", "on", "off", "parent", "children", "animate", "dispose"]
    );
    mock.cid = "o" + counter++;
    return mock;
  };

  var mocks, collection;

  beforeEach(function() {
    mocks = [mockProxy(), mockProxy(), mockProxy()];
    collection = new tabris.ProxyCollection(mocks);
  });

  it("maps proxies to numeric fields", function() {
    expect(collection[0]).toBe(mocks[0]);
    expect(collection[1]).toBe(mocks[1]);
    expect(collection[2]).toBe(mocks[2]);
  });

  it("sets length value", function() {
    expect(collection.length).toBe(3);
  });

  it("first()", function() {
    expect(collection.first()).toBe(mocks[0]);
  });

  it("last()", function() {
    expect(collection.last()).toBe(mocks[2]);
  });

  it("toArray()", function() {
    var arr1 = collection.toArray();
    var arr2 = collection.toArray();

    expect(arr1).toEqual(mocks);
    expect(arr2).toEqual(mocks);
    expect(arr1).not.toBe(arr2);
  });

  it("forEach()", function() {
    var callback = jasmine.createSpy();

    collection.forEach(callback);

    expect(callback).toHaveBeenCalledWith(mocks[0], 0, collection);
    expect(callback).toHaveBeenCalledWith(mocks[1], 1, collection);
    expect(callback).toHaveBeenCalledWith(mocks[2], 2, collection);
  });

  it("indexOf()", function() {
    expect(collection.indexOf(mocks[0])).toBe(0);
    expect(collection.indexOf(mocks[1])).toBe(1);
    expect(collection.indexOf(mocks[2])).toBe(2);
    expect(collection.indexOf(null)).toBe(-1);
  });

  describe("filter()", function() {

    it("with callback", function() {
      expect(collection.filter(function(proxy) {
        return proxy !== mocks[1];
      }).toArray()).toEqual([mocks[0], mocks[2]]);
    });

    it("with type selector", function() {
      mocks[0].type = "Foo";
      mocks[1].type = "Bar";
      mocks[2].type = "Foo";

      expect(collection.filter("Foo").toArray()).toEqual([mocks[0], mocks[2]]);
    });

    it("with * selector", function() {
      mocks[0].type = "Foo";
      mocks[1].type = "Bar";
      mocks[2].type = "Foo";

      expect(collection.filter("*").toArray()).toEqual(mocks);
    });

    it("with # selectors", function() {
      mocks[0].id = "foo";
      mocks[1].id = "bar";
      mocks[2].id = "bar";

      expect(collection.filter("#bar").toArray()).toEqual([mocks[1], mocks[2]]);
    });

  });

  describe("delegation:", function() {

    it("set() is delegated", function() {
      collection.set("foo", "bar");

      expect(mocks[0].set).toHaveBeenCalledWith("foo", "bar");
      expect(mocks[1].set).toHaveBeenCalledWith("foo", "bar");
      expect(mocks[2].set).toHaveBeenCalledWith("foo", "bar");
    });

    it("set() returns collection", function() {
      expect(collection.set("foo", "bar")).toBe(collection);
    });

    it("animate() is delegated", function() {
      var props = {foo: "bar"};
      var options = {delay: 3000};
      collection.animate(props, options);

      expect(mocks[0].animate).toHaveBeenCalledWith(props, options);
      expect(mocks[1].animate).toHaveBeenCalledWith(props, options);
      expect(mocks[2].animate).toHaveBeenCalledWith(props, options);
    });

    it("animate() returns collection", function() {
      expect(collection.animate({}, {})).toBe(collection);
    });

    it("on() is delegated", function() {
      var listener = function() {};
      collection.on("foo", listener);

      expect(mocks[0].on).toHaveBeenCalledWith("foo", listener);
      expect(mocks[1].on).toHaveBeenCalledWith("foo", listener);
      expect(mocks[2].on).toHaveBeenCalledWith("foo", listener);
    });

    it("on() returns collection", function() {
      expect(collection.on("foo", function() {})).toBe(collection);
    });

    it("off() is delegated", function() {
      var listener = function() {};
      collection.off("foo", listener);

      expect(mocks[0].off).toHaveBeenCalledWith("foo", listener);
      expect(mocks[1].off).toHaveBeenCalledWith("foo", listener);
      expect(mocks[2].off).toHaveBeenCalledWith("foo", listener);
    });

    it("off() returns collection", function() {
      expect(collection.off("foo", function() {})).toBe(collection);
    });

    it("dispose() is delegated", function() {
      collection.dispose();

      expect(mocks[0].dispose).toHaveBeenCalled();
      expect(mocks[1].dispose).toHaveBeenCalled();
      expect(mocks[2].dispose).toHaveBeenCalled();
    });

    it("dispose() returns undefined", function() {
      expect(collection.dispose()).toBeUndefined();
    });

    it("get() is delegated to first", function() {
      mocks[0].get.and.returnValue("foo");
      expect(collection.get("bar")).toBe("foo");
      expect(mocks[0].get).toHaveBeenCalledWith("bar");
    });

    it("get() returns undefined for empty collection", function() {
      expect((new tabris.ProxyCollection([])).get("foo")).toBeUndefined();
    });

    it("parent() returns all parents", function() {
      var parents = [mockProxy(), mockProxy()];
      mocks[0].parent.and.returnValue(parents[0]);
      mocks[2].parent.and.returnValue(parents[1]);

      expect(collection.parent().toArray()).toEqual(parents);
    });

    it("parent() returns only unique parents", function() {
      var parents = [mockProxy(), mockProxy()];
      mocks[0].parent.and.returnValue(parents[0]);
      mocks[1].parent.and.returnValue(parents[0]);
      mocks[2].parent.and.returnValue(parents[1]);

      expect(collection.parent().toArray()).toEqual(parents);
    });

    it("parent() returns undefined for empty collection", function() {
      expect((new tabris.ProxyCollection([])).parent()).toBeUndefined();
    });

    it("appendTo(parent) calls parent.append", function() {
      var parent = mockProxy();
      collection.appendTo(parent);
      expect(parent.append).toHaveBeenCalledWith(collection);
    });

    it("children() returns children from all in collection", function() {
      var children = [mockProxy(), mockProxy(), mockProxy(), mockProxy()];
      mocks[0]._children = children.slice(0, 2);
      mocks[2]._children = children.slice(2, 4);

      expect(collection.children().toArray()).toEqual(children);
    });

    it("children() with matcher returns children from all in collection", function() {
      var children = [mockProxy(), mockProxy(), mockProxy(), mockProxy()];
      children[0].type = children[2].type = "Foo";
      mocks[0]._children = children.slice(0, 2);
      mocks[2]._children = children.slice(2, 4);

      expect(collection.children("Foo").toArray()).toEqual([children[0], children[2]]);
    });

    it("find() returns descendants from all proxies in collection", function() {
      var children = [mockProxy(), mockProxy(), mockProxy(), mockProxy()];
      mocks[0]._children = [children[0]];
      mocks[2]._children = [children[1]];
      children[1]._children = children.slice(2, 4);

      expect(collection.find("*").toArray().length).toEqual(children.length);
      expect(collection.find("*").toArray()).toEqual(children);
    });

    it("find() returns no duplicates", function() {
      var children = [mockProxy(), mockProxy(), mockProxy(), mockProxy()];
      mocks[0]._children = [children[0]];
      children[0]._children = [children[1]];
      children[1]._children = [children[2]];
      children[2]._children = [children[3]];

      var result = collection.find("*").find("*");
      expect(result.length).toBe(3);
      expect(result.indexOf(children[1])).not.toBe(-1);
      expect(result.indexOf(children[2])).not.toBe(-1);
      expect(result.indexOf(children[3])).not.toBe(-1);
    });

  });

});
