/**
 * Copyright (c) 2014 EclipseSource.
 * All rights reserved.
 */

describe("CanvasContext", function() {

  var consoleBackup = window.console;
  var nativeBridge;
  var ctx;
  var gc;

  beforeEach(function() {
    window.console = jasmine.createSpyObj("console", ["log", "info", "warn", "error"]);
    nativeBridge = new NativeBridgeSpy();
    gc = new tabris.Proxy("gc-id");
    ctx = new tabris.CanvasContext(gc);
    tabris._reset();
    tabris._start(nativeBridge);
  });

  afterEach(function() {
    window.console = consoleBackup;
  });

  function getDrawOperations(index) {
    var call = nativeBridge.calls({ id: gc.id, op: "call", method: "draw" })[index || 0];
    return call ? call.parameters.operations : undefined;
  }

  describe("getContext", function() {

    var canvas;

    beforeEach(function() {
      canvas = new tabris.Proxy();
    });

    it("creates and returns graphics context", function() {
      var ctx = tabris.getContext(canvas, 100, 200);

      expect(ctx).toEqual(jasmine.any(tabris.CanvasContext));
    });

    it("returns same instance everytime", function() {
      var ctx1 = tabris.getContext(canvas, 100, 200);

      var ctx2 = tabris.getContext(canvas, 100, 200);

      expect(ctx2).toBe(ctx1);
    });

    it("calls init", function() {
      tabris.getContext(canvas, 100, 200);

      var call = nativeBridge.calls({ op: "call", method: "init" })[0];
      expect(call.parameters.width).toEqual(100);
      expect(call.parameters.height).toEqual(200);
    });

    it("calls init everytime", function() {
      tabris.getContext(canvas, 100, 200);

      tabris.getContext(canvas, 200, 100);

      var call = nativeBridge.calls({ op: "call", method: "init" })[1];
      expect(call.parameters.width).toEqual(200);
      expect(call.parameters.height).toEqual(100);
    });

    it("updates width and height in canvas dummy", function() {
      ctx = tabris.getContext(canvas, 100, 200);

      expect(ctx.canvas.width).toEqual(100);
      expect(ctx.canvas.height).toEqual(200);
    });

  });

  describe("lineWidth", function() {

    it("defaults to 1", function() {
      expect(ctx.lineWidth).toEqual(1);
    });

    it("accepts changes", function() {
      ctx.lineWidth = 2;

      expect(ctx.lineWidth).toEqual(2);
    });

    it("renders changes", function() {
      ctx.lineWidth = 2;
      ctx.stroke();

      expect(getDrawOperations()).toEqual([
        ["lineWidth", 2],
        ["stroke"]
      ]);
    });

    it("ignores zero and negative values", function() {
      ctx.lineWidth = 3;

      ctx.lineWidth = 0;
      ctx.lineWidth = -1;

      expect(ctx.lineWidth).toEqual(3);
    });

    it("issues a warning for invalid values", function() {
      ctx.lineWidth = -1;

      expect(window.console.warn).toHaveBeenCalledWith("Unsupported value for lineWidth: -1");
    });

  });

  describe("lineCap", function() {

    it("defaults to 'butt'", function() {
      expect(ctx.lineCap).toEqual("butt");
    });

    it("accepts changes", function() {
      ctx.lineCap = "round";

      expect(ctx.lineCap).toEqual("round");
    });

    it("renders changes", function() {
      ctx.lineCap = "round";
      ctx.stroke();

      expect(getDrawOperations()).toEqual([
        ["lineCap", "round"],
        ["stroke"]
      ]);
    });

    it("ignores unknown values", function() {
      ctx.lineCap = "round";

      ctx.lineCap = "unknown";

      expect(ctx.lineCap).toEqual("round");
    });

    it("issues a warning for invalid values", function() {
      ctx.lineCap = "foo";

      expect(window.console.warn).toHaveBeenCalledWith("Unsupported value for lineCap: foo");
    });

  });

  describe("lineJoin", function() {

    it("defaults to 'miter'", function() {
      expect(ctx.lineJoin).toEqual("miter");
    });

    it("accepts changes", function() {
      ctx.lineJoin = "round";

      expect(ctx.lineJoin).toEqual("round");
    });

    it("renders changes", function() {
      ctx.lineJoin = "round";
      ctx.stroke();

      expect(getDrawOperations()).toEqual([
        ["lineJoin", "round"],
        ["stroke"]
      ]);
    });

    it("ignores unknown values", function() {
      ctx.lineJoin = "round";

      ctx.lineJoin = "unknown";

      expect(ctx.lineJoin).toEqual("round");
    });

    it("issues a warning for invalid values", function() {
      ctx.lineJoin = "foo";

      expect(window.console.warn).toHaveBeenCalledWith("Unsupported value for lineJoin: foo");
    });

  });

  describe("fillStyle", function() {

    it("defaults to black", function() {
      expect(ctx.fillStyle).toEqual("rgba(0, 0, 0, 1)");
    });

    it("accepts changes", function() {
      ctx.fillStyle = "red";

      expect(ctx.fillStyle).toEqual("rgba(255, 0, 0, 1)");
    });

    it("renders changes", function() {
      ctx.fillStyle = "red";
      ctx.fill();

      expect(getDrawOperations()).toEqual([
        ["fillStyle", [255, 0, 0, 255]],
        ["fill"]
      ]);
    });

    it("ignores invalid color strings", function() {
      ctx.fillStyle = "red";

      ctx.fillStyle = "no-such-color";

      expect(ctx.fillStyle).toEqual("rgba(255, 0, 0, 1)");
    });

    it("issues a warning for invalid color strings", function() {
      ctx.fillStyle = "no-such-color";

      expect(window.console.warn)
        .toHaveBeenCalledWith("Unsupported value for fillStyle: no-such-color");
    });

  });

  describe("strokeStyle", function() {

    it("defaults to black", function() {
      expect(ctx.strokeStyle).toEqual("rgba(0, 0, 0, 1)");
    });

    it("accepts changes", function() {
      ctx.strokeStyle = "red";

      expect(ctx.strokeStyle).toEqual("rgba(255, 0, 0, 1)");
    });

    it("renders changes", function() {
      ctx.strokeStyle = "red";
      ctx.stroke();

      expect(getDrawOperations()).toEqual([
        ["strokeStyle", [255, 0, 0, 255]],
        ["stroke"]
      ]);
    });

    it("ignores invalid color strings", function() {
      ctx.strokeStyle = "red";

      ctx.strokeStyle = "no-such-color";

      expect(ctx.strokeStyle).toEqual("rgba(255, 0, 0, 1)");
    });

    it("issues a warning for invalid color strings", function() {
      ctx.strokeStyle = "no-such-color";

      expect(window.console.warn)
        .toHaveBeenCalledWith("Unsupported value for strokeStyle: no-such-color");
    });

  });

  describe("textAlign", function() {

    it("defaults to 'start'", function() {
      expect(ctx.textAlign).toEqual("start");
    });

    it("accepts changes", function() {
      ctx.textAlign = "center";

      expect(ctx.textAlign).toEqual("center");
    });

    it("renders changes", function() {
      ctx.textAlign = "center";
      ctx.fillText("foo", 10, 10);

      expect(getDrawOperations()).toEqual([
        ["textAlign", "center"],
        ["fillText", "foo", false, false, false, 10, 10]
      ]);
    });

    it("ignores unknown values", function() {
      ctx.textAlign = "center";

      ctx.textAlign = "unknown";

      expect(ctx.textAlign).toEqual("center");
    });

    it("issues a warning for invalid values", function() {
      ctx.textAlign = "foo";

      expect(window.console.warn).toHaveBeenCalledWith("Unsupported value for textAlign: foo");
    });

  });

  describe("textBaseline", function() {

    it("defaults to 'alphabetic'", function() {
      expect(ctx.textBaseline).toEqual("alphabetic");
    });

    it("accepts changes", function() {
      ctx.textBaseline = "middle";

      expect(ctx.textBaseline).toEqual("middle");
    });

    it("renders changes", function() {
      ctx.textBaseline = "middle";
      ctx.fillText("foo", 10, 10);

      expect(getDrawOperations()).toEqual([
        ["textBaseline", "middle"],
        ["fillText", "foo", false, false, false, 10, 10]
      ]);
    });

    it("ignores unknown values", function() {
      ctx.textBaseline = "middle";

      ctx.textBaseline = "unknown";

      expect(ctx.textBaseline).toEqual("middle");
    });

    it("issues a warning for invalid values", function() {
      ctx.textBaseline = "foo";

      expect(window.console.warn).toHaveBeenCalledWith("Unsupported value for textBaseline: foo");
    });

  });

  describe("save", function() {

    it("does not change current state", function() {
      ctx.strokeStyle = "red";
      ctx.save();

      expect(ctx.strokeStyle).toEqual("rgba(255, 0, 0, 1)");
    });

    it("renders save operation", function() {
      ctx.save();
      ctx.fill();

      expect(getDrawOperations()).toEqual([
        ["save"],
        ["fill"]
      ]);
    });

  });

  describe("restore", function() {

    it("restores previous state", function() {
      ctx.strokeStyle = "red";
      ctx.save();
      ctx.strokeStyle = "blue";

      ctx.restore();

      expect(ctx.strokeStyle).toEqual("rgba(255, 0, 0, 1)");
    });

    it("restores multiple steps", function() {
      ctx.strokeStyle = "red";
      ctx.save();
      ctx.strokeStyle = "blue";
      ctx.save();

      ctx.restore();
      ctx.restore();

      expect(ctx.strokeStyle).toEqual("rgba(255, 0, 0, 1)");
    });

    it("does not change current state when stack is empty", function() {
      ctx.strokeStyle = "red";

      ctx.restore();

      expect(ctx.strokeStyle).toEqual("rgba(255, 0, 0, 1)");
    });

    it("renders restore operation", function() {
      ctx.restore();
      ctx.fill();

      expect(getDrawOperations()).toEqual([
        ["restore"],
        ["fill"]
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

      expect(getDrawOperations()).not.toBeDefined();
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

      ctx.fill();

      expect(getDrawOperations().length).toEqual(9);
      expect(getDrawOperations()[0]).toEqual(["beginPath"]);
      expect(getDrawOperations()[7]).toEqual(["closePath"]);
      expect(getDrawOperations()[8]).toEqual(["fill"]);
    });

    it("moveTo", function() {
      ctx.moveTo(10, 20);
      ctx.fill();

      expect(getDrawOperations()[0]).toEqual(["moveTo", 10, 20]);
    });

    it("lineTo", function() {
      ctx.lineTo(10, 20);
      ctx.fill();

      expect(getDrawOperations()[0]).toEqual(["lineTo", 10, 20]);
    });

    it("rect", function() {
      ctx.rect(10, 20, 30, 40);
      ctx.fill();

      expect(getDrawOperations()[0]).toEqual(["rect", 10, 20, 30, 40]);
    });

    it("arc", function() {
      ctx.arc(10, 20, 5, 1, 2);
      ctx.fill();

      expect(getDrawOperations()[0]).toEqual(["arc", 10, 20, 5, 1, 2, false]);
    });

    it("arc with anticlockwise", function() {
      ctx.arc(10, 20, 5, 1, 2, true);
      ctx.fill();

      expect(getDrawOperations()[0]).toEqual(["arc", 10, 20, 5, 1, 2, true]);
    });

    it("quadraticCurve", function() {
      ctx.quadraticCurveTo(10, 20, 30, 40);
      ctx.fill();

      expect(getDrawOperations()[0]).toEqual(["quadraticCurveTo", 10, 20, 30, 40]);
    });

    it("bezierCurve", function() {
      ctx.bezierCurveTo(10, 20, 30, 40, 50, 60);
      ctx.fill();

      expect(getDrawOperations()[0]).toEqual(["bezierCurveTo", 10, 20, 30, 40, 50, 60]);
    });

  });

  describe("fill", function() {

    it("is rendered immediately", function() {
      ctx.beginPath();
      ctx.rect(10, 20, 30, 40);
      ctx.fill();

      expect(getDrawOperations()).toEqual([
        ["beginPath"],
        ["rect", 10, 20, 30, 40],
        ["fill"]
      ]);
    });

    it("clears operations stack", function() {
      ctx.beginPath();
      ctx.rect(10, 20, 30, 40);
      ctx.fill();
      ctx.beginPath();
      ctx.rect(50, 60, 70, 80);
      ctx.fill();

      expect(getDrawOperations(1)).toEqual([
        ["beginPath"],
        ["rect", 50, 60, 70, 80],
        ["fill"]
      ]);
    });

  });

  describe("stroke", function() {

    it("is rendered immediately", function() {
      ctx.beginPath();
      ctx.rect(10, 20, 30, 40);
      ctx.stroke();

      expect(getDrawOperations()).toEqual([
        ["beginPath"],
        ["rect", 10, 20, 30, 40],
        ["stroke"]
      ]);
    });

    it("clears operations stack", function() {
      ctx.beginPath();
      ctx.rect(10, 20, 30, 40);
      ctx.stroke();
      ctx.beginPath();
      ctx.rect(50, 60, 70, 80);
      ctx.stroke();

      expect(getDrawOperations(1)).toEqual([
        ["beginPath"],
        ["rect", 50, 60, 70, 80],
        ["stroke"]
      ]);
    });

  });

  describe("clearRect", function() {

    it("is rendered immediately", function() {
      ctx.clearRect(10, 20, 30, 40);

      expect(getDrawOperations()).toEqual([
        ["clearRect", 10, 20, 30, 40]
      ]);
    });

  });

  describe("fillRect", function() {

    it("is rendered immediately", function() {
      ctx.fillRect(10, 20, 30, 40);

      expect(getDrawOperations()).toEqual([
        ["beginPath"],
        ["rect", 10, 20, 30, 40],
        ["fill"]
      ]);
    });

  });

  describe("strokeRect", function() {

    it("is rendered immediately", function() {
      ctx.strokeRect(10, 20, 30, 40);

      expect(getDrawOperations()).toEqual([
        ["beginPath"],
        ["rect", 10, 20, 30, 40],
        ["stroke"]
      ]);
    });

  });

  describe("fillText", function() {

    it("is rendered immediately", function() {
      ctx.fillText("foo", 10, 20);

      expect(getDrawOperations()).toEqual([
        ["fillText", "foo", false, false, false, 10, 20]
      ]);
    });

  });

  describe("strokeText", function() {

    it("is rendered immediately", function() {
      ctx.strokeText("foo", 10, 20);

      expect(getDrawOperations()).toEqual([
        ["strokeText", "foo", false, false, false, 10, 20]
      ]);
    });

  });

});
