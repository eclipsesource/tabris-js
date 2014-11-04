/**
 * Copyright (c) 2014 EclipseSource.
 * All rights reserved.
 */

describe("tabris.registerWidget", function() {

  var nativeBridge;

  beforeEach(function() {
    nativeBridge = new NativeBridgeSpy();
    tabris._reset();
    tabris._start(nativeBridge);
  });

  afterEach(function() {
    delete tabris.TestType;
  });

  it("adds default listen copy", function() {
    tabris.registerWidget("TestType", {});
    expect(tabris.TestType._listen).toEqual(tabris.registerWidget._defaultListen);
    expect(tabris.TestType._listen).not.toBe(tabris.registerWidget._defaultListen);
  });

  it("adds default trigger copy", function() {
    tabris.registerWidget("TestType", {});
    expect(tabris.TestType._trigger).toEqual(tabris.registerWidget._defaultTrigger);
    expect(tabris.TestType._trigger).not.toBe(tabris.registerWidget._defaultTrigger);
  });

  it("extends default listen", function() {
    var custom = {foo: "bar", touchstart: false};
    tabris.registerWidget("TestType", {_listen: custom});
    expect(tabris.TestType._listen).toEqual(
      util.extend({}, tabris.registerWidget._defaultListen, custom)
    );
  });

  it("extends default trigger", function() {
    var custom = {foo: "bar", touchstart: false};
    tabris.registerWidget("TestType", {_trigger: custom});
    expect(tabris.TestType._trigger).toEqual(
      util.extend({}, tabris.registerWidget._defaultTrigger, custom)
    );
  });

});
