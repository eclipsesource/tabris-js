describe("Legacy CanvasContext", function() {

  var consoleBackup = window.console;
  var nativeBridge;
  var ctx;
  var gc;

  beforeEach(function() {
    window.console = jasmine.createSpyObj("console", ["log", "info", "warn", "error"]);
    nativeBridge = new NativeBridgeSpy();
    tabris._init(nativeBridge);
    gc = tabris.create("_GC");
    nativeBridge.resetCalls();
    ctx = new tabris.LegacyCanvasContext(gc);
    tabris._reset();
  });

  afterEach(function() {
    window.console = consoleBackup;
    gc.dispose();
  });

  function flush() {
    tabris.trigger("flush");
  }

  function getDrawOperations() {
    var call = nativeBridge.calls({id: gc.cid, op: "call", method: "draw"})[0];
    return call ? call.parameters.operations : undefined;
  }

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
      flush();

      expect(getDrawOperations()).toEqual([
        ["lineWidth", 2]
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
      flush();

      expect(getDrawOperations()).toEqual([
        ["lineCap", "round"]
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
      flush();

      expect(getDrawOperations()).toEqual([
        ["lineJoin", "round"]
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
      flush();

      expect(getDrawOperations()).toEqual([
        ["fillStyle", [255, 0, 0, 255]]
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
      flush();

      expect(getDrawOperations()).toEqual([
        ["strokeStyle", [255, 0, 0, 255]]
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
      flush();

      expect(getDrawOperations()).toEqual([
        ["textAlign", "center"]
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
      flush();

      expect(getDrawOperations()).toEqual([
        ["textBaseline", "middle"]
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
      flush();

      expect(getDrawOperations()).toEqual([
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
      flush();

      expect(getDrawOperations()).toEqual([
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

      flush();

      expect(getDrawOperations().length).toEqual(8);
      expect(getDrawOperations()[0]).toEqual(["beginPath"]);
      expect(getDrawOperations()[7]).toEqual(["closePath"]);
    });

    it("are not rendered after gc disposal anymore", function() {
      ctx.rect(10, 20, 30, 40);

      gc.dispose();
      flush();

      expect(getDrawOperations()).not.toBeDefined();
    });

    it("moveTo", function() {
      ctx.moveTo(10, 20);
      flush();

      expect(getDrawOperations()[0]).toEqual(["moveTo", 10, 20]);
    });

    it("lineTo", function() {
      ctx.lineTo(10, 20);
      flush();

      expect(getDrawOperations()[0]).toEqual(["lineTo", 10, 20]);
    });

    it("rect", function() {
      ctx.rect(10, 20, 30, 40);
      flush();

      expect(getDrawOperations()[0]).toEqual(["rect", 10, 20, 30, 40]);
    });

    it("arc", function() {
      ctx.arc(10, 20, 5, 1, 2);
      flush();

      expect(getDrawOperations()[0]).toEqual(["arc", 10, 20, 5, 1, 2, false]);
    });

    it("arc with anticlockwise", function() {
      ctx.arc(10, 20, 5, 1, 2, true);
      flush();

      expect(getDrawOperations()[0]).toEqual(["arc", 10, 20, 5, 1, 2, true]);
    });

    it("quadraticCurve", function() {
      ctx.quadraticCurveTo(10, 20, 30, 40);
      flush();

      expect(getDrawOperations()[0]).toEqual(["quadraticCurveTo", 10, 20, 30, 40]);
    });

    it("bezierCurve", function() {
      ctx.bezierCurveTo(10, 20, 30, 40, 50, 60);
      flush();

      expect(getDrawOperations()[0]).toEqual(["bezierCurveTo", 10, 20, 30, 40, 50, 60]);
    });

  });

  describe("transformations", function() {

    it("aren't rendered before flush", function() {
      ctx.setTransform(1, 2, 3, 4, 5, 6);
      ctx.transform(1, 2, 3, 4, 5, 6);
      ctx.translate(23, 42);
      ctx.rotate(3.14);
      ctx.scale(2, 3);

      expect(getDrawOperations()).not.toBeDefined();
    });

    it("are rendered on flush", function() {
      ctx.setTransform(1, 2, 3, 4, 5, 6);
      ctx.transform(1, 2, 3, 4, 5, 6);
      ctx.translate(23, 42);
      ctx.rotate(3.14);
      ctx.scale(2, 3);

      flush();

      expect(getDrawOperations().length).toEqual(5);
      expect(getDrawOperations()[0]).toEqual(["setTransform", 1, 2, 3, 4, 5, 6]);
      expect(getDrawOperations()[4]).toEqual(["scale", 2, 3]);
    });

    it("scale", function() {
      ctx.scale(2, 3);
      flush();

      expect(getDrawOperations()[0]).toEqual(["scale", 2, 3]);
    });

    it("rotate", function() {
      ctx.rotate(3.14);
      flush();

      expect(getDrawOperations()[0]).toEqual(["rotate", 3.14]);
    });

    it("translate", function() {
      ctx.translate(23, 42);
      flush();

      expect(getDrawOperations()[0]).toEqual(["translate", 23, 42]);
    });

    it("transform", function() {
      ctx.transform(1, 2, 3, 4, 5, 6);
      flush();

      expect(getDrawOperations()[0]).toEqual(["transform", 1, 2, 3, 4, 5, 6]);
    });

    it("setTransform", function() {
      ctx.setTransform(1, 2, 3, 4, 5, 6);
      flush();

      expect(getDrawOperations()[0]).toEqual(["setTransform", 1, 2, 3, 4, 5, 6]);
    });

  });

  describe("fill", function() {

    it("is rendered", function() {
      ctx.fill();
      flush();

      expect(getDrawOperations()).toEqual([
        ["fill"]
      ]);
    });

  });

  describe("stroke", function() {

    it("is rendered", function() {
      ctx.stroke();
      flush();

      expect(getDrawOperations()).toEqual([
        ["stroke"]
      ]);
    });

  });

  describe("clearRect", function() {

    it("is rendered", function() {
      ctx.clearRect(10, 20, 30, 40);
      flush();

      expect(getDrawOperations()).toEqual([
        ["clearRect", 10, 20, 30, 40]
      ]);
    });

  });

  describe("fillRect", function() {

    it("is rendered", function() {
      ctx.fillRect(10, 20, 30, 40);
      flush();

      expect(getDrawOperations()).toEqual([
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

      expect(getDrawOperations()).toEqual([
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

      expect(getDrawOperations()).toEqual([
        ["fillText", "foo", false, false, false, 10, 20]
      ]);
    });

  });

  describe("strokeText", function() {

    it("is rendered", function() {
      ctx.strokeText("foo", 10, 20);
      flush();

      expect(getDrawOperations()).toEqual([
        ["strokeText", "foo", false, false, false, 10, 20]
      ]);
    });

  });

  describe("measureText", function() {

    it("is rendered", function() {
      expect(ctx.measureText("foo").width).toBeGreaterThan("foo".length);
    });

  });

});
