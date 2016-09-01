import {expect, spy, stub, restore} from "../test";
import {createType} from "../../src/tabris/create-type";
import Proxy from "../../src/tabris/Proxy";
import ProxyStore from "../../src/tabris/ProxyStore";
import {types} from "../../src/tabris/property-types";
import NativeBridge from "../../src/tabris/NativeBridge";
import NativeBridgeSpy from "./NativeBridgeSpy";

describe("createType", function() {

  let nativeBridge;

  beforeEach(function() {
    nativeBridge = new NativeBridgeSpy();
    global.tabris = {
      _on: () => {},
      _proxies: new ProxyStore()
    };
    global.tabris._nativeBridge = new NativeBridge(nativeBridge);
  });

  afterEach(restore);

  it("creates a constructor", function() {
    let CustomType = createType("CustomType", {});

    let instance = new CustomType({foo: 42});

    expect(instance).to.be.instanceof(CustomType);
    expect(instance).to.be.instanceof(Proxy);
  });

  it("adds members to new type", function() {
    let CustomType = createType("CustomType", {foo: 23});

    let instance = new CustomType();

    expect(instance.foo).to.equal(23);
  });

  it("adds JS property setters", function() {
    let type = {encode: function() {}, decode: function() {}};
    let CustomType = createType("CustomType", {_properties: {foo: {type: type}}});
    let instance = new CustomType();
    spy(instance, "set");

    instance.foo = "bar";

    expect(instance.set).to.have.been.calledWith("foo", "bar");
  });

  it("adds JS property getters", function() {
    let type = {encode: function() {}, decode: function() {}};
    let CustomType = createType("CustomType", {_properties: {foo: {type: type}}});
    let instance = new CustomType();
    stub(instance, "get").returns("bar");

    let result = instance.foo;

    expect(result).to.equal("bar");
  });

  it("adds empty trigger map to constructor", function() {
    let CustomType = createType("CustomType", {});
    let instance = new CustomType();

    expect(instance.constructor._trigger).to.eql({});
  });

  it("adds _events to constructor", function() {
    let CustomType = createType("CustomType", {_events: {foo: "bar"}});
    let instance = new CustomType();

    expect(instance.constructor._events.foo).to.eql({name: "bar"});
    expect(instance._events).to.equal(Proxy.prototype._events);
  });

  it("adds normalized _events to constructor", function() {
    let CustomType = createType("CustomType", {_events: {foo: "bar", foo2: {alias: "foo3"}}});
    let instance = new CustomType();

    expect(instance.constructor._events.foo).to.eql({name: "bar"});
    expect(instance.constructor._events.foo2).to.eql({name: "foo2", alias: "foo3", originalName: "foo2"});
    expect(instance.constructor._events.foo3).to.equal(instance.constructor._events.foo2);
    expect(instance._events).not.to.equal(instance.constructor._events);
  });

  it("adds empty events map to constructor", function() {
    let CustomType = createType("CustomType", {});
    let instance = new CustomType();

    expect(instance.constructor._events).to.eql({});
  });

  it("adds _properties to constructor", function() {
    let type = {encode: function() {}, decode: function() {}};
    let CustomType = createType("CustomType", {_properties: {foo: {type: type}}});
    let instance = new CustomType();

    expect(instance.constructor._properties.foo.type).to.equal(type);
  });

  it("replaces type strings with type definition object", function() {
    let CustomType = createType("CustomType", {_properties: {foo: {type: "boolean"}}});
    let instance = new CustomType();

    expect(instance.constructor._properties.foo.type).to.equal(types.boolean);
  });

  it("wraps encode function if type is given as an array", function() {
    let type = ["choice", ["a", "b", "c"]];
    spy(types.choice, "encode");
    let CustomType = createType("CustomType", {_properties: {foo: type}});
    let instance = new CustomType();

    instance.set("foo", "bar");

    expect(types.choice.encode).to.have.been.calledWith("bar", ["a", "b", "c"]);
    expect(instance.constructor._properties.foo.type.encode)
      .not.to.equal(types.choice.encode);
  });

  it("wraps decode function if type is given as an array", function() {
    let type = ["bounds", ["customarg"]];
    stub(types.bounds, "encode").returns("bar");
    spy(types.bounds, "decode");
    let CustomType = createType("CustomType", {_properties: {foo: type}});
    let instance = new CustomType();
    instance.set("foo", "bar");

    instance.get("foo");

    expect(types.bounds.decode).to.have.been.calledWith("bar", ["customarg"]);
    expect(instance.constructor._properties.foo.type.decode)
      .not.to.equal(types.bounds.decode);
  });

  it("throws if type string is not found in PropertyTypes object", function() {
    expect(() => {
      createType("CustomType", {_properties: {foo: {type: "nothing"}}});
    }).to.throw();
  });

  it("adds normalized _properties to constructor", function() {
    let CustomType = createType("CustomType", {_properties: {foo: "boolean"}});
    let instance = new CustomType();

    expect(instance.constructor._properties.foo.type).to.equal(types.boolean);
  });

  it("adds empty properties map to constructor", function() {
    let CustomType = createType("CustomType", {});
    let instance = new CustomType();

    expect(instance.constructor._properties).to.eql({});
  });

  it("adds _type to constructor", function() {
    let CustomType = createType("CustomType", {_type: "foo"});
    let instance = new CustomType();

    expect(instance.constructor._type).to.equal("foo");
    expect(instance._type).not.to.be.defined;
  });

  describe("constructor", function() {

    let TestType;

    beforeEach(function() {
      TestType = createType("TestType", {_properties: {foo: "any"}});
    });

    it("fails if tabris.js not yet started", function() {
      global.tabris._ready = false;
      delete tabris._nativeBridge;

      expect(() => {
        new TestType();
      }).to.throw(Error, "tabris.js not started");
    });

    it("creates a non-empty cid", function() {
      let proxy = new TestType();

      expect(typeof proxy.cid).to.equal("string");
      expect(proxy.cid.length).to.be.above(0);
    });

    it("creates different cids for subsequent calls", function() {
      let proxy1 = new TestType();
      let proxy2 = new TestType();

      expect(proxy1.cid).not.to.equal(proxy2.cid);
    });

    it("creates an instance of Proxy", function() {
      let result = new TestType();

      expect(result).to.be.instanceof(TestType);
    });

    it("triggers a create operation with type and properties", function() {
      let proxy = new TestType({foo: 23});
      let createCall = nativeBridge.calls({op: "create", id: proxy.cid})[0];

      expect(createCall.type).to.equal("TestType");
      expect(createCall.properties.foo).to.equal(23);
    });

    it("triggers a create operation with _type if present", function() {
      let CustomType = createType("CustomType", {_type: "foo.Type"});
      new CustomType();

      expect(nativeBridge.calls({op: "create"})[0].type).to.equal("foo.Type");
    });

    it("cannot be called as a function", function() {
      expect(() => {
        TestType({foo: 42});
      }).to.throw(Error, "Cannot call constructor as a function");
    });

  });

  describe("constructor for singletons", function() {

    let ServiceType;

    beforeEach(function() {
      ServiceType = createType("ServiceType", {_cid: "foo"});
    });

    it("respects _cid", function() {
      let instance = new ServiceType();

      expect(instance).to.be.instanceof(ServiceType);
      expect(instance.cid).to.equal("foo");
    });

    it("does not call create for service objects", function() {
      new ServiceType();

      expect(nativeBridge.calls({op: "create"}).length).to.equal(0);
    });

    it("prevents multiple instances", function() {
      new ServiceType();

      expect(() => {
        new ServiceType();
      }).to.throw(Error, /cid.*foo/);
    });

  });

});
