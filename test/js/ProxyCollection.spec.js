/**
 * Copyright (c) 2014 EclipseSource.
 * All rights reserved.
 */

describe("ProxyCollection", function() {

  var mockProxy = function() {
    return jasmine.createSpyObj("Proxy",
      ["set", "get", "append", "appendTo", "on", "off", "parent", "children", "animate"]
    );
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

});
