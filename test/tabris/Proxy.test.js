import {expect, spy, stub, restore} from "../test";
import {createType} from "../../src/tabris/create-type";
import Proxy from "../../src/tabris/Proxy";
import ProxyStore from "../../src/tabris/ProxyStore";
import {types} from "../../src/tabris/property-types";
import NativeBridge from "../../src/tabris/NativeBridge";
import NativeBridgeSpy from "./NativeBridgeSpy";

describe("Proxy", function() {

  let nativeBridge;
  let TestType;

  beforeEach(function() {
    nativeBridge = new NativeBridgeSpy();
    global.tabris = {
      _on: () => {},
      _proxies: new ProxyStore()
    };
    global.tabris._nativeBridge = new NativeBridge(nativeBridge);
    TestType = createType("TestType", {
      _properties: {foo: "any", uncachedProperty: {type: "any", nocache: true}},
      _events: {bar: true}
    });
  });

  afterEach(restore);

  describe("create", function() {

    let proxy;

    beforeEach(function() {
      proxy = new TestType();
      nativeBridge.resetCalls();
    });

    // it("creates proxy for standard types", function() {
    //   new Button({text: "foo"});

    //   let create = nativeBridge.calls({op: "create"})[0];
    //   expect(create.type).to.eql("Button");
    // });

    it("calls native create with properties", function() {
      proxy._create({foo: 23});

      let calls = nativeBridge.calls({op: "create", type: "TestType"});
      expect(calls.length).to.equal(1);
      expect(calls[0].properties).to.eql({foo: 23});
    });

    it("translates properties", function() {
      let other = new Proxy("other-id");
      TestType._properties.foo.type = types.proxy;

      proxy._create({foo: other});

      let properties = nativeBridge.calls({op: "create", type: "TestType"})[0].properties;
      expect(properties.foo).to.equal("other-id");
    });

    it("sends native set for init properties", function() {
      let CustomType = createType("CustomType", {
        _initProperties: {foo: 23},
        _properties: {bar: "any"}
      });

      new CustomType({bar: 42});

      let properties = nativeBridge.calls({op: "create", type: "CustomType"})[0].properties;
      expect(properties).to.eql({foo: 23, bar: 42});
    });

    it("does not raise warning for init properties", function() {
      let CustomType = createType("CustomType", {_initProperties: {foo: 23}});
      spy(console, "warn");

      new CustomType();

      expect(console.warn).not.to.have.been.called;
    });

    it("does not modify prototype properties", function() {
      let CustomType = createType("CustomType", {_initProperties: {}});

      new CustomType({foo: 23});

      expect(CustomType._initProperties).to.eql({});
    });

  });

  describe("instance", function() {

    let proxy;

    beforeEach(function() {
      proxy = new TestType();
      nativeBridge.resetCalls();
    });

    // it("parent() returns nothing", function() {
    //   expect(proxy.parent()).not.to.be.defined;
    // });

    // it("children() returns empty collection", function() {
    //   expect(proxy.children()).to.be.instanceof(ProxyCollection);
    //   expect(proxy.children().length).to.equal(0);
    // });

    it("isDisposed() returns false", function() {
      expect(proxy.isDisposed()).to.equal(false);
    });

    describe("get", function() {

      it("does not call native get for unknown properties", function() {
        proxy.get("bar");

        expect(nativeBridge.calls({op: "get"}).length).to.equal(0);
      });

      it("calls native get", function() {
        proxy.get("foo");

        expect(nativeBridge.calls({op: "get", property: "foo"}).length).to.equal(1);
      });

      it("returns uncached value from native", function() {
        stub(nativeBridge, "get").returns(23);
        proxy.set("uncachedProperty", 12);

        let result = proxy.get("uncachedProperty");

        expect(result).to.equal(23);
      });

      it("returns uncached value from default config", function() {
        TestType._properties.foo.default = 23;

        let result = proxy.get("foo");

        expect(result).to.equal(23);
      });

      it("returns cloned value from default function", function() {
        TestType._properties.foo.default = () => [];

        proxy.get("foo").push(1);

        expect(proxy.get("foo")).to.eql([]);
      });

      it("returns cached value", function() {
        proxy.set("foo", "bar");
        spy(nativeBridge, "get");

        let result = proxy.get("foo");

        expect(nativeBridge.get).not.to.have.been.called;
        expect(result).to.equal("bar");
      });

      it("returns cached value decoded", function() {
        TestType._properties.foo.type = types.color;
        proxy.set("foo", "#ff00ff");

        let result = proxy.get("foo");

        expect(result).to.equal("rgba(255, 0, 255, 1)");
      });

      it("raises no warning for unknown property", function() {
        spy(console, "warn");

        proxy.get("unknownProperty", true);

        expect(console.warn).not.to.have.been.called;
      });

      it("decodes value if there is a decoder", function() {
        TestType._properties.foo.type = {
          decode: stub().returns("bar")
        };
        stub(nativeBridge, "get").returns(23);
        spy(console, "warn");

        let result = proxy.get("foo");

        expect(result).to.equal("bar");
        expect(TestType._properties.foo.type.decode).to.have.been.calledWith(23);
        expect(console.warn).not.to.have.been.called;
      });

      it("fails on disposed object", function() {
        proxy.dispose();

        expect(() => {
          proxy.get("foo");
        }).to.throw(Error, "Object is disposed");
      });

    });

    describe("set", function() {

      it("translation does not modify properties", function() {
        let other = new Proxy("other-id");
        let properties = {foo: other};

        proxy.set(properties);

        expect(properties.foo).to.equal(other);
      });

      it("raises no warning for unknown property", function() {
        spy(console, "warn");

        proxy.set("unknownProperty", true);

        expect(console.warn).not.to.have.been.called;
      });

      it("stores unknown property loacally", function() {
        proxy.set("unknownProperty", "foo");

        expect(nativeBridge.calls({op: "set", id: proxy.cid}).length).to.equal(0);
        expect(proxy.get("unknownProperty")).to.equal("foo");
      });

      it("do not SET the value if _properties entry references a function that throws", function() {
        TestType._properties.knownProperty = {type: "boolean"};
        stub(types.boolean, "encode").throws(new Error("My Error"));

        proxy.set("knownProperty", "foo");

        expect(nativeBridge.calls({op: "set"}).length).to.equal(0);
      });

      it("returns self to allow chaining", function() {
        let result = proxy.set("foo", 23);

        expect(result).to.equal(proxy);
      });

      it("fails on disposed object", function() {
        proxy.dispose();

        expect(() => {
          proxy.set("foo", 23);
        }).to.throw(Error, "Object is disposed");
      });

      it("triggers change event for known properties", function() {
        TestType._properties.foo = {type: "any", default: ""};
        let listener = spy();
        proxy.on("change:foo", listener);

        proxy.set("foo", "bar");

        expect(listener).to.have.been.calledWith(proxy, "bar", {});
      });

      it("triggers change event for known properties with options object", function() {
        TestType._properties.foo = {type: "any", default: ""};
        let listener = spy();
        proxy.on("change:foo", listener);

        proxy.set("foo", "bar", {foo2: "bar2"});

        expect(listener).to.have.been.calledWith(proxy, "bar", {foo2: "bar2"});
      });

      it("triggers change event with decoded property value", function() {
        TestType._properties.foo = {type: types.color};
        let listener = spy();
        proxy.on("change:foo", listener);

        proxy.set("foo", "#ff00ff");

        expect(listener.args[0][1]).to.equal("rgba(255, 0, 255, 1)");
      });

      it("triggers no change event if value is unchanged from default", function() {
        TestType._properties.foo = {type: "any", default: ""};
        let listener = spy();
        proxy.on("change:foo", listener);

        proxy.set("foo", "");

        expect(listener).not.to.have.been.called;

      });

      it("triggers no change event if value is unchanged from previous value", function() {
        TestType._properties.foo = {type: "any", default: ""};
        let listener = spy();
        proxy.set("foo", "bar");
        proxy.on("change:foo", listener);

        proxy.set("foo", "bar");

        expect(listener).not.to.have.been.called;
      });

      it("always triggers initial change event for cached properties without default", function() {
        TestType._properties.foo = {type: "any"};
        let listener = spy();
        proxy.on("change:foo", listener);

        proxy.set("foo", "bar");
        proxy.set("foo", "bar");

        expect(listener).to.have.been.calledOnce;
      });

    });

    describe("_nativeCall", function() {

      it("calls native call", function() {
        proxy._nativeCall("method", {foo: 23});

        let call = nativeBridge.calls()[0];
        expect(call.op).to.eql("call");
        expect(call.method).to.eql("method");
        expect(call.parameters).to.eql({foo: 23});
      });

      it("returns value from native", function() {
        stub(nativeBridge, "call").returns(23);

        let result = proxy._nativeCall("method", {});

        expect(result).to.equal(23);
      });

      it("fails on disposed object", function() {
        proxy.dispose();

        expect(() => {
          proxy._nativeCall("foo", {});
        }).to.throw(Error, "Object is disposed");
      });

    });

    describe("on", function() {

      let listener;

      beforeEach(function() {
        listener = spy();
        nativeBridge.resetCalls();
      });

      it("calls native listen (true) for first listener", function() {
        proxy.on("bar", listener);

        let call = nativeBridge.calls({op: "listen", event: "bar"})[0];
        expect(call.listen).to.eql(true);
      });

      it("calls native listen with translated event name", function() {
        let CustomType = createType("CustomType", {_events: {foo: "bar"}});
        proxy = new CustomType();
        proxy.on("foo", listener);

        let call = nativeBridge.calls({op: "listen"})[0];
        expect(call.event).to.equal("bar");
      });

      it("calls native listen (true) for first alias listener", function() {
        let CustomType = createType("CustomType", {_events: {foo: {name: "bar", alias: "foo1"}}});
        proxy = new CustomType();

        proxy.on("foo1", listener);

        let call = nativeBridge.calls({op: "listen", event: "bar"})[0];
        expect(call.listen).to.eql(true);
      });

      it("calls custom listen", function() {
        TestType._events.bar.listen = spy();

        proxy.on("bar", listener);

        expect(TestType._events.bar.listen).to.have.been.calledWith(true, false);
      });

      it("calls custom listen with alias flag", function() {
        let CustomType = createType("CustomType", {
          _events: {foo: {alias: "foo1", listen: spy()}}
        });
        proxy = new CustomType();

        proxy.on("foo1", listener);

        expect(CustomType._events.foo.listen).to.have.been.calledWith(true, true);
      });

      it("calls native listen for another listener for another event", function() {
        TestType._events.bar = {name: "bar"};

        proxy.on("foo", listener);
        proxy.on("bar", listener);

        let call = nativeBridge.calls({op: "listen", event: "bar"})[0];
        expect(call.listen).to.eql(true);
      });

      it("does not call native listen for subsequent listeners for the same event", function() {
        proxy.on("bar", listener);
        proxy.on("bar", listener);

        expect(nativeBridge.calls({op: "listen"}).length).to.equal(1);
      });

      it("does not call native listen for subsequent listeners for alias event", function() {
        let CustomType = createType("CustomType", {_events: {foo: {alias: "bar"}}});
        proxy = new CustomType();
        proxy.on("foo", listener);
        proxy.on("bar", listener);

        expect(nativeBridge.calls({op: "listen"}).length).to.equal(1);
      });

      it("does not call native listen for subsequent listeners for aliased event", function() {
        let CustomType = createType("CustomType", {_events: {foo: {alias: "bar"}}});
        proxy = new CustomType();
        proxy.on("bar", listener);
        proxy.on("foo", listener);

        expect(nativeBridge.calls({op: "listen"}).length).to.equal(1);
      });

      it("returns self to allow chaining", function() {
        let result = proxy.on("foo", listener);

        expect(result).to.equal(proxy);
      });

      it("does not fail on disposed object", function() {
        proxy.dispose();

        expect(() => {
          proxy.on("foo", listener);
        }).not.to.throw();
      });

    });

    describe("off", function() {

      let listener, listener2;

      beforeEach(function() {
        listener = spy();
        listener2 = spy();
        proxy.on("bar", listener);
        nativeBridge.resetCalls();
      });

      it("calls native listen (false) for last listener removed", function() {
        proxy.off("bar", listener);

        let call = nativeBridge.calls({op: "listen", event: "bar"})[0];
        expect(call.listen).to.equal(false);
      });

      it("calls native listen (false) for last alias listener removed", function() {
        let CustomType = createType("CustomType", {_events: {foo: {alias: "bar"}}});
        proxy = new CustomType();
        proxy.on("bar", listener);

        proxy.off("bar", listener);

        let call = nativeBridge.calls({op: "listen", event: "foo"})[1];
        expect(call.listen).to.equal(false);
      });

      it("calls native listen with translated event name", function() {
        let CustomType = createType("CustomType", {_events: {foo: "bar"}});
        proxy = new CustomType();
        proxy.on("foo", listener);
        proxy.off("foo", listener);

        let call = nativeBridge.calls({op: "listen"})[1];
        expect(call.event).to.equal("bar");
      });

      it("does not call native listen when other listeners exist for same event", function() {
        proxy.on("bar", listener2);
        proxy.off("bar", listener);

        expect(nativeBridge.calls().length).to.equal(0);
      });

      it("does not call native listen when other listeners exist for alias event", function() {
        let CustomType = createType("CustomType", {_events: {foo: {alias: "bar"}}});
        proxy = new CustomType();
        proxy.on("foo", listener);
        proxy.on("bar", listener);
        nativeBridge.resetCalls();

        proxy.off("foo", listener);

        expect(nativeBridge.calls().length).to.equal(0);
      });

      it("does not call native listen when other listeners exist for aliased event", function() {
        let CustomType = createType("CustomType", {_events: {foo: {alias: "bar"}}});
        proxy = new CustomType();
        proxy.on("foo", listener);
        proxy.on("bar", listener);
        nativeBridge.resetCalls();

        proxy.off("bar", listener);

        expect(nativeBridge.calls().length).to.equal(0);
      });

      it("calls native listen when not other listeners exist for aliased or alias event", function() {
        let CustomType = createType("CustomType", {_events: {foo: {alias: "bar"}}});
        proxy = new CustomType();
        proxy.on("foo", listener);
        proxy.on("bar", listener);
        nativeBridge.resetCalls();

        proxy.off("bar", listener);
        proxy.off("foo", listener);

        expect(nativeBridge.calls().length).to.equal(1);
      });

      it("calls native listen when not other listeners exist for aliased or alias event (reversed off)", function() {
        let CustomType = createType("CustomType", {_events: {foo: {alias: "bar"}}});
        proxy = new CustomType();
        proxy.on("foo", listener);
        proxy.on("bar", listener);
        nativeBridge.resetCalls();

        proxy.off("foo", listener);
        proxy.off("bar", listener);

        expect(nativeBridge.calls().length).to.equal(1);
      });

      it("returns self to allow chaining", function() {
        let result = proxy.off("foo", listener);

        expect(result).to.equal(proxy);
      });

      it("does not fail on disposed object", function() {
        proxy.dispose();

        expect(() => {
          proxy.off("foo", listener);
        }).not.to.throw();
      });

    });

    describe("dispose", function() {

      it("calls native destroy", function() {
        proxy.dispose();

        let destroyCall = nativeBridge.calls({op: "destroy", id: proxy.cid})[0];
        expect(destroyCall).to.be.defined;
      });

      it("notifies dispose listeners", function() {
        let listener = spy();
        proxy.on("dispose", listener);

        proxy.dispose();

        expect(listener).to.have.been.calledWith(proxy, {});
      });

      it("notifies dispose listeners before native destroy", function() {
        proxy.on("dispose", () => {
          expect(nativeBridge.calls({op: "destroy"}).length).to.eql(0);
        });

        proxy.dispose();
      });

      it("does not call native destroy twice when called twice", function() {
        proxy.dispose();
        proxy.dispose();

        expect(nativeBridge.calls({op: "destroy"}).length).to.equal(1);
      });

      it("can be called from within a dispose listener", function() {
        proxy.on("dispose", () => proxy.dispose());

        expect(() => {
          proxy.dispose();
        }).not.to.throw();
      });

    });

    describe("when disposed", function() {

      beforeEach(function() {
        proxy.dispose();
      });

      it("isDisposed returns true", function() {
        expect(proxy.isDisposed()).to.equal(true);
      });

    });

  });

});
