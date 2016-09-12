import ProxyStore from "../../src/tabris/ProxyStore";
import NativeBridge from "../../src/tabris/NativeBridge";
import NativeBridgeSpy from "./NativeBridgeSpy";
import {expect, stub, spy, restore} from "../test";
import Layout from "../../src/tabris/Layout";
import Composite from "../../src/tabris/widgets/Composite";
import Widget from "../../src/tabris/Widget";

describe("Layout", function() {

  describe("checkConsistency", function() {

    let check = Layout.checkConsistency;

    beforeEach(function() {
      stub(console, "warn");
    });

    afterEach(restore);

    it("raises a warning for inconsistent layoutData (width)", function() {
      check({top: 0, left: 0, right: 0, width: 100});

      let warning = "Inconsistent layoutData: left and right are set, ignore width";
      expect(console.warn).to.have.been.calledWith(warning);
    });

    it("skips overridden properties from layoutData (width)", function() {
      let result = check({top: 0, left: 0, right: 0, width: 100});

      expect(result).to.eql({top: 0, left: 0, right: 0});
    });

    it("raises a warning for inconsistent layoutData (height)", function() {
      check({top: 0, left: 0, bottom: 0, height: 100});

      let warning = "Inconsistent layoutData: top and bottom are set, ignore height";
      expect(console.warn).to.have.been.calledWith(warning);
    });

    it("skips overridden properties from layoutData (height)", function() {
      let result = check({top: 0, left: 0, bottom: 0, height: 100});

      expect(result).to.eql({top: 0, left: 0, bottom: 0});
    });

    it("raises a warning for inconsistent layoutData (centerX)", function() {
      check({top: 0, left: 0, centerX: 0});

      let warning = "Inconsistent layoutData: centerX overrides left and right";
      expect(console.warn).to.have.been.calledWith(warning);
    });

    it("skips overridden properties from layoutData (centerX)", function() {
      let result = check({top: 1, left: 2, right: 3, centerX: 4});

      expect(result).to.eql({top: 1, centerX: 4});
    });

    it("raises a warning for inconsistent layoutData (centerY)", function() {
      check({left: 0, top: 0, centerY: 0});

      let warning = "Inconsistent layoutData: centerY overrides top and bottom";
      expect(console.warn).to.have.been.calledWith(warning);
    });

    it("skips overridden properties from layoutData (centerY)", function() {
      let result = check({left: 1, top: 2, bottom: 3, centerY: 4});

      expect(result).to.eql({left: 1, centerY: 4});
    });

    it("raises a warning for inconsistent layoutData (baseline)", function() {
      check({left: 0, top: 0, baseline: "#other"});

      let warning = "Inconsistent layoutData: baseline overrides top, bottom, and centerY";
      expect(console.warn).to.have.been.calledWith(warning);
    });

    it("skips overridden properties from layoutData (baseline)", function() {
      let result = check({left: 1, top: 2, bottom: 3, centerY: 4, baseline: "other"});

      expect(result).to.eql({left: 1, baseline: "other"});
    });

  });

  describe("resolveReferences", function() {

    let resolve = Layout.resolveReferences;
    let parent, widget, other, TestType;

    beforeEach(function() {
      global.tabris = {
        on: () => {},
        _proxies: new ProxyStore()
      };
      global.tabris._nativeBridge = new NativeBridge(new NativeBridgeSpy());
      TestType = Widget.extend("TestType", {});
      parent = new Composite();
      widget = new TestType().appendTo(parent);
      other = new TestType({id: "other"}).appendTo(parent);
    });

    it("translates widget to ids", function() {
      let input = {centerY: other, left: [other, 42]};
      let expected = {centerY: other.cid, left: [other.cid, 42]};

      expect(resolve(input, widget)).to.eql(expected);
    });

    it("translates selectors to ids", function() {
      let input = {baseline: "#other", left: ["#other", 42]};
      let expected = {baseline: other.cid, left: [other.cid, 42]};

      expect(resolve(input, widget)).to.eql(expected);
    });

    it("translates 'prev()' selector to id", function() {
      let input = {baseline: "prev()", left: ["prev()", 42]};
      let expected = {baseline: widget.cid, left: [widget.cid, 42]};

      expect(resolve(input, other)).to.eql(expected);
    });

    it("translates 'prev()' selector to 0 on first widget", function() {
      let input = {baseline: "prev()", left: ["prev()", 42]};
      let expected = {baseline: 0, left: [0, 42]};

      expect(resolve(input, widget)).to.eql(expected);
    });

    it("does not modify numbers", function() {
      let input = {centerX: 23, left: [30, 42]};
      let expected = {centerX: 23, left: [30, 42]};

      expect(resolve(input, widget)).to.eql(expected);
    });

    it("treats ambiguous string as selector", function() {
      let Foo = Widget.extend({_name: "Foo%"});
      let freak1 = new Foo().appendTo(parent);
      let freak2 = new TestType({id: "23%"}).appendTo(parent);

      expect(resolve({left: ["Foo%", 23], top: ["#23%", 42]}, widget))
        .to.eql({left: [freak1.cid, 23], top: [freak2.cid, 42]});
    });

    it("replaces unresolved selector (due to missing sibling) with 0", function() {
      other.dispose();

      expect(resolve({baseline: "#noone", left: ["#noone", 42]}, widget))
        .to.eql({baseline: 0, left: [0, 42]});
    });

    it("replaces unresolved selector (due to missing parent) with 0", function() {
      widget = new TestType();

      expect(resolve({baseline: "#noone", left: ["#noone", 42]}, widget))
        .to.eql({baseline: 0, left: [0, 42]});
    });

  });

  describe("layoutQueue", function() {

    it("calls '_flushLayout' on registered widgets once", function() {
      let widget = {
        _flushLayout: spy()
      };
      Layout.addToQueue(widget);

      Layout.flushQueue(widget);
      Layout.flushQueue(widget);

      expect(widget._flushLayout).to.have.been.calledOnce;
    });

  });

});
