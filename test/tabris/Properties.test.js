import {expect, stub, restore} from "../test";
import Properties from "../../src/tabris/Properties";
import {types} from "../../src/tabris/property-types";
import Events from "../../src/tabris/Events";

describe("Properties", function() {
  let object;
  let TestType;

  beforeEach(function() {
    TestType = function() {};
    TestType._properties = {};
    object = new TestType();
    object.toString = function() {
      return "TestType";
    };
    Object.assign(object, Properties);
  });

  afterEach(restore);

  it ("set returns self", function() {
    expect(object.set("foo", "bar")).to.equal(object);
  });

  it ("set calls _checkDisposed", function() {
    object._checkDisposed = stub();

    object.set("foo", "bar");

    expect(object._checkDisposed).to.have.been.called;
  });

  it ("set stores single property", function() {
    object.set("foo", "bar");
    expect(object.get("foo")).to.equal("bar");
  });

  it ("set stores multiple properties", function() {
    object.set({foo: "bar", foo2: "bar2"});
    expect(object.get("foo")).to.equal("bar");
    expect(object.get("foo2")).to.equal("bar2");
  });

  it ("get returns undefined for unset property", function() {
    expect(object.get("foo")).to.be.undefined;
  });

  it ("get returns default value if nothing was set", function() {
    TestType._properties.foo = {default: "bar"};

    expect(object.get("foo")).to.equal("bar");
  });

  it ("get does not return default value if something was set", function() {
    TestType._properties.foo = {default: "bar"};

    object.set("foo", "something else");

    expect(object.get("foo")).to.equal("something else");
  });

  it("calls encoding function if present", function() {
    TestType._properties.knownProperty = {type: {
      encode: stub().returns(true)
    }};
    stub(console, "warn");

    object.set("knownProperty", true);

    expect(TestType._properties.knownProperty.type.encode).to.have.been.called;
    expect(console.warn).to.have.not.been.called;
  });

  it("raises a warning if encoding function throws", function() {
    TestType._properties.knownProperty = {type: {
      encode: stub().throws(new Error("My Error"))
    }};
    stub(console, "warn");

    object.set("knownProperty", true);

    let message = "TestType: Ignored unsupported value for property \"knownProperty\": My Error";
    expect(console.warn).to.have.been.calledWith(message);
  });

  it ("get returns value from decoding function if present", function() {
    TestType._properties.foo = {type: {
      decode: stub().returns("bar2")
    }};

    object.set("foo", "bar");

    let value = object.get("foo");

    expect(TestType._properties.foo.type.decode).to.have.been.calledWith("bar");
    expect(value).to.equal("bar2");
  });

  describe("get", function() {

    it ("calls custom getter with property name", function() {
      let getter = stub();
      object.set("foo", "bar");
      TestType._properties.foo = {get: getter};

      object.get("foo");

      expect(getter).to.have.been.calledWith("foo");
    });

    it ("returns value from custom getter", function() {
      TestType._properties.foo = {get: stub().returns("bar")};

      expect(object.get("foo")).to.equal("bar");
    });

  });

  describe("set", function() {

    it ("calls custom setter", function() {
      let setter = stub();
      TestType._properties.foo = {set: setter};
      object.set("foo", "bar");

      expect(setter).to.have.been.calledWith("foo", "bar", {});
    });

    it ("stores nothing if custom setter exists", function() {
      TestType._properties.foo = {set: function() {}};
      object.set("foo", "bar");

      expect(object.get("foo")).to.equal(undefined);
    });

    it ("calls custom setter with options", function() {
      let setter = stub().returns(true);
      TestType._properties.foo = {set: setter};
      object.set("foo", "bar", {foo2: "bar2"});

      expect(setter).to.have.been.calledWith("foo", "bar", {foo2: "bar2"});
    });

  });

  describe("with Events:", function() {

    let listener;

    beforeEach(function() {
      Object.assign(object, Events);
      listener = stub();
    });

    it ("set triggers change event", function() {
      object.on("change:foo", listener);

      object.set("foo", "bar");

      expect(listener).to.have.been.calledOnce;
      expect(listener).to.have.been.calledWith(object, "bar", {});
    });

    it ("set triggers change event with decoded value", function() {
      TestType._properties.foo = {type: types.boolean};
      object.on("change:foo", listener);

      object.set("foo", "bar");

      expect(listener).to.have.been.calledOnce;
      expect(listener).to.have.been.calledWith(object, true, {});
    });

    it ("set (two parameters) triggers change event with options", function() {
      object.on("change:foo", listener);

      object.set({foo: "bar"}, {foo2: "bar2"});

      expect(listener).to.have.been.calledOnce;
      expect(listener).to.have.been.calledWith(object, "bar", {foo2: "bar2"});
    });

    it ("set (three parameters) triggers change event with options", function() {
      object.on("change:foo", listener);

      object.set("foo", "bar", {foo2: "bar2"});

      expect(listener).to.have.been.calledOnce;
      expect(listener).to.have.been.calledWith(object, "bar", {foo2: "bar2"});
    });

    it ("set triggers no change event if value is unchanged", function() {
      object.set("foo", "bar");
      object.on("change:foo", listener);

      object.set("foo", "bar");

      expect(listener).to.have.not.been.called;
    });

    it ("set triggers no change event if encoded value is unchanged", function() {
      TestType._properties.foo = {type: types.boolean};
      object.set("foo", true);
      object.on("change:foo", listener);

      object.set("foo", "bar");

      expect(listener).to.have.not.been.called;
    });

  });

});
