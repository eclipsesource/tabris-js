import {expect, spy, restore} from "../test";
import ProxyStore from "../../src/tabris/ProxyStore";
import NativeBridge from "../../src/tabris/NativeBridge";
import NativeBridgeSpy from "./NativeBridgeSpy";
import Events from "../../src/tabris/Events";
import LegacyCanvasContext from "../../src/tabris/LegacyCanvasContext";
import GC from "../../src/tabris/GC";

describe("Legacy CanvasContext", function() {

  let nativeBridge;
  let ctx;
  let gc;

  beforeEach(function() {
    nativeBridge = new NativeBridgeSpy();
    global.tabris = Object.assign({
      on: () => {},
      off: () => {},
      _proxies: new ProxyStore()
    }, Events);
    global.device = {platform: "Android"};
    global.tabris._nativeBridge = new NativeBridge(nativeBridge);
    gc = new GC();
    ctx = new LegacyCanvasContext(gc);
  });

  afterEach(function() {
    restore();
    gc.dispose();
  });

  function flush() {
    tabris.trigger("flush");
  }

  function getDrawOperations() {
    let call = nativeBridge.calls({id: gc.cid, op: "call", method: "draw"})[0];
    return call ? call.parameters.operations : undefined;
  }

  describe("lineWidth", function() {

    it("defaults to 1", function() {
      expect(ctx.lineWidth).to.eql(1);
    });

    it("accepts changes", function() {
      ctx.lineWidth = 2;

      expect(ctx.lineWidth).to.eql(2);
    });

    it("renders changes", function() {
      ctx.lineWidth = 2;
      flush();

      expect(getDrawOperations()).to.eql([
        ["lineWidth", 2]
      ]);
    });

    it("ignores zero and negative values, but prints a warning", function() {
      spy(console, "warn");
      ctx.lineWidth = 3;

      ctx.lineWidth = 0;
      ctx.lineWidth = -1;

      expect(ctx.lineWidth).to.eql(3);
      expect(console.warn).to.have.been.calledWith("Unsupported value for lineWidth: -1");
    });

  });

  describe("lineCap", function() {

    it("defaults to 'butt'", function() {
      expect(ctx.lineCap).to.eql("butt");
    });

    it("accepts changes", function() {
      ctx.lineCap = "round";

      expect(ctx.lineCap).to.eql("round");
    });

    it("renders changes", function() {
      ctx.lineCap = "round";
      flush();

      expect(getDrawOperations()).to.eql([
        ["lineCap", "round"]
      ]);
    });

    it("ignores unknown values, but prints a warning", function() {
      spy(console, "warn");
      ctx.lineCap = "round";

      ctx.lineCap = "foo";

      expect(ctx.lineCap).to.eql("round");
      expect(console.warn).to.have.been.calledWith("Unsupported value for lineCap: foo");
    });

  });

  describe("lineJoin", function() {

    it("defaults to 'miter'", function() {
      expect(ctx.lineJoin).to.eql("miter");
    });

    it("accepts changes", function() {
      ctx.lineJoin = "round";

      expect(ctx.lineJoin).to.eql("round");
    });

    it("renders changes", function() {
      ctx.lineJoin = "round";
      flush();

      expect(getDrawOperations()).to.eql([
        ["lineJoin", "round"]
      ]);
    });

    it("ignores unknown values, but prints a warning", function() {
      spy(console, "warn");
      ctx.lineJoin = "round";

      ctx.lineJoin = "foo";

      expect(ctx.lineJoin).to.eql("round");
      expect(console.warn).to.have.been.calledWith("Unsupported value for lineJoin: foo");
    });

  });

  describe("fillStyle", function() {

    it("defaults to black", function() {
      expect(ctx.fillStyle).to.eql("rgba(0, 0, 0, 1)");
    });

    it("accepts changes", function() {
      ctx.fillStyle = "red";

      expect(ctx.fillStyle).to.eql("rgba(255, 0, 0, 1)");
    });

    it("renders changes", function() {
      ctx.fillStyle = "red";
      flush();

      expect(getDrawOperations()).to.eql([
        ["fillStyle", [255, 0, 0, 255]]
      ]);
    });

    it("ignores invalid color strings, but prints a warning", function() {
      spy(console, "warn");
      ctx.fillStyle = "red";

      ctx.fillStyle = "no-such-color";

      expect(ctx.fillStyle).to.eql("rgba(255, 0, 0, 1)");
      expect(console.warn).to.have.been.calledWith("Unsupported value for fillStyle: no-such-color");
    });

  });

  describe("strokeStyle", function() {

    it("defaults to black", function() {
      expect(ctx.strokeStyle).to.eql("rgba(0, 0, 0, 1)");
    });

    it("accepts changes", function() {
      ctx.strokeStyle = "red";

      expect(ctx.strokeStyle).to.eql("rgba(255, 0, 0, 1)");
    });

    it("renders changes", function() {
      ctx.strokeStyle = "red";
      flush();

      expect(getDrawOperations()).to.eql([
        ["strokeStyle", [255, 0, 0, 255]]
      ]);
    });

    it("ignores invalid color strings, but prints a warning", function() {
      spy(console, "warn");
      ctx.strokeStyle = "red";

      ctx.strokeStyle = "no-such-color";

      expect(ctx.strokeStyle).to.eql("rgba(255, 0, 0, 1)");
      expect(console.warn).to.have.been.calledWith("Unsupported value for strokeStyle: no-such-color");
    });

  });

  describe("textAlign", function() {

    it("defaults to 'start'", function() {
      expect(ctx.textAlign).to.eql("start");
    });

    it("accepts changes", function() {
      ctx.textAlign = "center";

      expect(ctx.textAlign).to.eql("center");
    });

    it("renders changes", function() {
      ctx.textAlign = "center";
      flush();

      expect(getDrawOperations()).to.eql([
        ["textAlign", "center"]
      ]);
    });

    it("ignores unknown values, but prints a warning", function() {
      spy(console, "warn");
      ctx.textAlign = "center";

      ctx.textAlign = "foo";

      expect(ctx.textAlign).to.eql("center");
      expect(console.warn).to.have.been.calledWith("Unsupported value for textAlign: foo");
    });

  });

  describe("textBaseline", function() {

    it("defaults to 'alphabetic'", function() {
      expect(ctx.textBaseline).to.eql("alphabetic");
    });

    it("accepts changes", function() {
      ctx.textBaseline = "middle";

      expect(ctx.textBaseline).to.eql("middle");
    });

    it("renders changes", function() {
      ctx.textBaseline = "middle";
      flush();

      expect(getDrawOperations()).to.eql([
        ["textBaseline", "middle"]
      ]);
    });

    it("ignores unknown values, but prints a warning", function() {
      spy(console, "warn");
      ctx.textBaseline = "middle";

      ctx.textBaseline = "foo";

      expect(ctx.textBaseline).to.eql("middle");
      expect(console.warn).to.have.been.calledWith("Unsupported value for textBaseline: foo");
    });

  });

  describe("save", function() {

    it("does not change current state", function() {
      ctx.strokeStyle = "red";
      ctx.save();

      expect(ctx.strokeStyle).to.eql("rgba(255, 0, 0, 1)");
    });

    it("renders save operation", function() {
      ctx.save();
      flush();

      expect(getDrawOperations()).to.eql([
        ["save"]
      ]);
    });

  });

  describe("restore", function() {

    it("restores previous state", function() {
      ctx.strokeStyle = "red";
      ctx.save();
      ctx.strokeStyle = "blue";

      ctx.restore();

      expect(ctx.strokeStyle).to.eql("rgba(255, 0, 0, 1)");
    });

    it("restores multiple steps", function() {
      ctx.strokeStyle = "red";
      ctx.save();
      ctx.strokeStyle = "blue";
      ctx.save();

      ctx.restore();
      ctx.restore();

      expect(ctx.strokeStyle).to.eql("rgba(255, 0, 0, 1)");
    });

    it("does not change current state when stack is empty", function() {
      ctx.strokeStyle = "red";

      ctx.restore();

      expect(ctx.strokeStyle).to.eql("rgba(255, 0, 0, 1)");
    });

    it("renders restore operation", function() {
      ctx.restore();
      flush();

      expect(getDrawOperations()).to.eql([
        ["restore"]
      ]);
    });

  });

  describe("path operations", function() {

    it("aren't rendered before flush", function() {
      ctx.beginPath();
      ctx.moveTo(10, 20);
      ctx.lineTo(30, 40);
      ctx.rect(30, 40, 10, 20);
      ctx.arc(30, 40, 10, 1, 2);
      ctx.quadraticCurveTo(40, 50, 50, 60);
      ctx.bezierCurveTo(50, 70, 60, 80, 70, 80);
      ctx.closePath();

      expect(getDrawOperations()).to.be.undefined;
    });

    it("are rendered on flush", function() {
      ctx.beginPath();
      ctx.moveTo(10, 20);
      ctx.lineTo(30, 40);
      ctx.rect(30, 40, 10, 20);
      ctx.arc(30, 40, 10, 1, 2);
      ctx.quadraticCurveTo(40, 50, 50, 60);
      ctx.bezierCurveTo(50, 70, 60, 80, 70, 80);
      ctx.closePath();

      flush();

      expect(getDrawOperations().length).to.eql(8);
      expect(getDrawOperations()[0]).to.eql(["beginPath"]);
      expect(getDrawOperations()[7]).to.eql(["closePath"]);
    });

    it("are not rendered after gc disposal anymore", function() {
      ctx.rect(10, 20, 30, 40);

      gc.dispose();
      flush();

      expect(getDrawOperations()).to.be.undefined;
    });

    it("moveTo", function() {
      ctx.moveTo(10, 20);
      flush();

      expect(getDrawOperations()[0]).to.eql(["moveTo", 10, 20]);
    });

    it("lineTo", function() {
      ctx.lineTo(10, 20);
      flush();

      expect(getDrawOperations()[0]).to.eql(["lineTo", 10, 20]);
    });

    it("rect", function() {
      ctx.rect(10, 20, 30, 40);
      flush();

      expect(getDrawOperations()[0]).to.eql(["rect", 10, 20, 30, 40]);
    });

    it("arc", function() {
      ctx.arc(10, 20, 5, 1, 2);
      flush();

      expect(getDrawOperations()[0]).to.eql(["arc", 10, 20, 5, 1, 2, false]);
    });

    it("arc with anticlockwise", function() {
      ctx.arc(10, 20, 5, 1, 2, true);
      flush();

      expect(getDrawOperations()[0]).to.eql(["arc", 10, 20, 5, 1, 2, true]);
    });

    it("quadraticCurve", function() {
      ctx.quadraticCurveTo(10, 20, 30, 40);
      flush();

      expect(getDrawOperations()[0]).to.eql(["quadraticCurveTo", 10, 20, 30, 40]);
    });

    it("bezierCurve", function() {
      ctx.bezierCurveTo(10, 20, 30, 40, 50, 60);
      flush();

      expect(getDrawOperations()[0]).to.eql(["bezierCurveTo", 10, 20, 30, 40, 50, 60]);
    });

  });

  describe("transformations", function() {

    it("aren't rendered before flush", function() {
      ctx.setTransform(1, 2, 3, 4, 5, 6);
      ctx.transform(1, 2, 3, 4, 5, 6);
      ctx.translate(23, 42);
      ctx.rotate(3.14);
      ctx.scale(2, 3);

      expect(getDrawOperations()).to.be.undefined;
    });

    it("are rendered on flush", function() {
      ctx.setTransform(1, 2, 3, 4, 5, 6);
      ctx.transform(1, 2, 3, 4, 5, 6);
      ctx.translate(23, 42);
      ctx.rotate(3.14);
      ctx.scale(2, 3);

      flush();

      expect(getDrawOperations().length).to.eql(5);
      expect(getDrawOperations()[0]).to.eql(["setTransform", 1, 2, 3, 4, 5, 6]);
      expect(getDrawOperations()[4]).to.eql(["scale", 2, 3]);
    });

    it("scale", function() {
      ctx.scale(2, 3);
      flush();

      expect(getDrawOperations()[0]).to.eql(["scale", 2, 3]);
    });

    it("rotate", function() {
      ctx.rotate(3.14);
      flush();

      expect(getDrawOperations()[0]).to.eql(["rotate", 3.14]);
    });

    it("translate", function() {
      ctx.translate(23, 42);
      flush();

      expect(getDrawOperations()[0]).to.eql(["translate", 23, 42]);
    });

    it("transform", function() {
      ctx.transform(1, 2, 3, 4, 5, 6);
      flush();

      expect(getDrawOperations()[0]).to.eql(["transform", 1, 2, 3, 4, 5, 6]);
    });

    it("setTransform", function() {
      ctx.setTransform(1, 2, 3, 4, 5, 6);
      flush();

      expect(getDrawOperations()[0]).to.eql(["setTransform", 1, 2, 3, 4, 5, 6]);
    });

  });

  describe("fill", function() {

    it("is rendered", function() {
      ctx.fill();
      flush();

      expect(getDrawOperations()).to.eql([
        ["fill"]
      ]);
    });

  });

  describe("stroke", function() {

    it("is rendered", function() {
      ctx.stroke();
      flush();

      expect(getDrawOperations()).to.eql([
        ["stroke"]
      ]);
    });

  });

  describe("clearRect", function() {

    it("is rendered", function() {
      ctx.clearRect(10, 20, 30, 40);
      flush();

      expect(getDrawOperations()).to.eql([
        ["clearRect", 10, 20, 30, 40]
      ]);
    });

  });

  describe("fillRect", function() {

    it("is rendered", function() {
      ctx.fillRect(10, 20, 30, 40);
      flush();

      expect(getDrawOperations()).to.eql([
        ["beginPath"],
        ["rect", 10, 20, 30, 40],
        ["fill"]
      ]);
    });

  });

  describe("strokeRect", function() {

    it("is rendered", function() {
      ctx.strokeRect(10, 20, 30, 40);
      flush();

      expect(getDrawOperations()).to.eql([
        ["beginPath"],
        ["rect", 10, 20, 30, 40],
        ["stroke"]
      ]);
    });

  });

  describe("fillText", function() {

    it("is rendered", function() {
      ctx.fillText("foo", 10, 20);
      flush();

      expect(getDrawOperations()).to.eql([
        ["fillText", "foo", false, false, false, 10, 20]
      ]);
    });

  });

  describe("strokeText", function() {

    it("is rendered", function() {
      ctx.strokeText("foo", 10, 20);
      flush();

      expect(getDrawOperations()).to.eql([
        ["strokeText", "foo", false, false, false, 10, 20]
      ]);
    });

  });

  describe("measureText", function() {

    it("is rendered", function() {
      expect(ctx.measureText("foo").width).to.be.above("foo".length);
    });

  });

});
