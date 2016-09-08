describe("CanvasContext", function() {

  var nativeBridge;
  var ctx;
  var gc;

  beforeEach(function() {
    tabris._reset();
    nativeBridge = new NativeBridgeSpy();
    tabris._init(nativeBridge);
    gc = new tabris._GC();
    nativeBridge.resetCalls();
    ctx = new tabris.CanvasContext(gc);
    tabris._reset();
  });

  afterEach(function() {
    gc.dispose();
  });

  function flush() {
    tabris.trigger("flush");
  }

  function getLastPacket() {
    var calls = nativeBridge.calls({id: gc.cid, op: "call", method: "draw"});
    return calls.length ? calls[calls.length - 1].parameters.packedOperations : undefined;
  }

  function decodeLastPacket() {
    var calls = nativeBridge.calls({id: gc.cid, op: "call", method: "draw"});
    return calls.length ? decode(calls[calls.length - 1].parameters.packedOperations) : {};
  }

  function decode(packet) {
    var values = {};
    var opcodes = packet[0];
    values.ops = packet[1].map(opIndex => opcodes[opIndex]);
    ["doubles", "booleans", "strings", "ints"].forEach((name, index) => {
      var slot = packet[index + 2];
      if (slot.length) {
        values[name] = slot;
      }
    });
    return values;
  }

  describe("getContext", function() {

    var canvas;

    beforeEach(function() {
      canvas = new tabris.Canvas();
      nativeBridge.resetCalls();
    });

    it("returns null without \"2d\" parameter", function() {
      expect(canvas.getContext("foo", 100, 200)).toBe(null);
    });

    it("creates a native GC with parent", function() {
      canvas.getContext("2d", 100, 200);

      var createCalls = nativeBridge.calls({op: "create", type: "rwt.widgets.GC"});
      expect(createCalls.length).toBe(1);
      expect(createCalls[0].properties.parent).toBe(canvas.cid);
    });

    it("creates and returns graphics context", function() {
      var ctx = canvas.getContext("2d", 100, 200);

      expect(ctx).toEqual(jasmine.any(tabris.LegacyCanvasContext));
    });

    it("returns same instance everytime", function() {
      var ctx1 = canvas.getContext("2d", 100, 200);

      var ctx2 = canvas.getContext("2d", 100, 200);

      expect(ctx2).toBe(ctx1);
    });

    it("calls init", function() {
      canvas.getContext("2d", 100, 200);

      var call = nativeBridge.calls({op: "call", method: "init"})[0];
      expect(call.parameters.width).toEqual(100);
      expect(call.parameters.height).toEqual(200);
    });

    it("calls init everytime", function() {
      canvas.getContext("2d", 100, 200);

      canvas.getContext("2d", 200, 100);

      var call = nativeBridge.calls({op: "call", method: "init"})[1];
      expect(call.parameters.width).toEqual(200);
      expect(call.parameters.height).toEqual(100);
    });

    it("updates width and height in canvas dummy", function() {
      ctx = canvas.getContext("2d", 100, 200);

      expect(ctx.canvas.width).toEqual(100);
      expect(ctx.canvas.height).toEqual(200);
    });

    it("allows to set canvas.style attributes", function() {
      // Used by third party libraries, ensure this doesn't crash
      ctx.canvas.style.width = 23;
      expect(ctx.canvas.style.width).toBe(23);
    });

  });

  describe("property", function() {

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

        expect(decodeLastPacket()).toEqual({ops: ["lineWidth"], doubles: [2]});
      });

      it("ignores zero and negative values, but prints a warning", function() {
        spyOn(console, "warn");
        ctx.lineWidth = 3;

        ctx.lineWidth = 0;
        ctx.lineWidth = -1;

        expect(ctx.lineWidth).toEqual(3);
        expect(console.warn).toHaveBeenCalledWith("Unsupported value for lineWidth: 0");
        expect(console.warn).toHaveBeenCalledWith("Unsupported value for lineWidth: -1");
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

        expect(decodeLastPacket()).toEqual({ops: ["lineCap"], strings: ["round"]});
      });

      it("ignores unknown values, but prints a warning", function() {
        spyOn(console, "warn");
        ctx.lineCap = "round";

        ctx.lineCap = "foo";

        expect(ctx.lineCap).toEqual("round");
        expect(console.warn).toHaveBeenCalledWith("Unsupported value for lineCap: foo");
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

        expect(decodeLastPacket()).toEqual({ops: ["lineJoin"], strings: ["round"]});
      });

      it("ignores unknown values, but prints a warning", function() {
        spyOn(console, "warn");
        ctx.lineJoin = "round";

        ctx.lineJoin = "foo";

        expect(ctx.lineJoin).toEqual("round");
        expect(console.warn).toHaveBeenCalledWith("Unsupported value for lineJoin: foo");
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

        expect(decodeLastPacket()).toEqual({ops: ["fillStyle"], ints: [255, 0, 0, 255]});
      });

      it("ignores invalid color strings, but prints a warning", function() {
        spyOn(console, "warn");
        ctx.fillStyle = "red";

        ctx.fillStyle = "no-such-color";

        expect(ctx.fillStyle).toEqual("rgba(255, 0, 0, 1)");
        expect(console.warn).toHaveBeenCalledWith("Unsupported value for fillStyle: no-such-color");
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

        expect(decodeLastPacket()).toEqual({ops: ["strokeStyle"], ints: [255, 0, 0, 255]});
      });

      it("ignores invalid color strings, but prints a warning", function() {
        spyOn(console, "warn");
        ctx.strokeStyle = "red";

        ctx.strokeStyle = "no-such-color";

        expect(ctx.strokeStyle).toEqual("rgba(255, 0, 0, 1)");
        expect(console.warn).toHaveBeenCalledWith("Unsupported value for strokeStyle: no-such-color");
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

        expect(decodeLastPacket()).toEqual({ops: ["textAlign"], strings: ["center"]});
      });

      it("ignores unknown values, but prints a warning", function() {
        spyOn(console, "warn");
        ctx.textAlign = "center";

        ctx.textAlign = "foo";

        expect(ctx.textAlign).toEqual("center");
        expect(console.warn).toHaveBeenCalledWith("Unsupported value for textAlign: foo");
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

        expect(decodeLastPacket()).toEqual({ops: ["textBaseline"], strings: ["middle"]});
      });

      it("ignores unknown values, but prints a warning", function() {
        spyOn(console, "warn");
        ctx.textBaseline = "middle";

        ctx.textBaseline = "foo";

        expect(ctx.textBaseline).toEqual("middle");
        expect(console.warn).toHaveBeenCalledWith("Unsupported value for textBaseline: foo");
      });

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

      expect(decodeLastPacket()).toEqual({ops: ["save"]});
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

      expect(decodeLastPacket()).toEqual({ops: ["restore"]});
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

      expect(getLastPacket()).not.toBeDefined();
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

      expect(decodeLastPacket().ops).toEqual(["beginPath", "moveTo", "lineTo", "rect", "arc",
                                              "quadraticCurveTo", "bezierCurveTo", "closePath"]);
    });

    it("are not rendered after gc disposal anymore", function() {
      ctx.rect(10, 20, 30, 40);

      gc.dispose();
      flush();

      expect(getLastPacket()).not.toBeDefined();
    });

  });

  describe("transformations", function() {

    it("aren't rendered before flush", function() {
      ctx.setTransform(1, 2, 3, 4, 5, 6);
      ctx.transform(1, 2, 3, 4, 5, 6);
      ctx.translate(23, 42);
      ctx.rotate(3.14);
      ctx.scale(2, 3);

      expect(getLastPacket()).not.toBeDefined();
    });

    it("are rendered on flush", function() {
      ctx.setTransform(1, 2, 3, 4, 5, 6);
      ctx.transform(1, 2, 3, 4, 5, 6);
      ctx.translate(23, 42);
      ctx.rotate(3.14);
      ctx.scale(2, 3);

      flush();

      expect(decodeLastPacket().ops).toEqual(["setTransform", "transform", "translate",
                                              "rotate", "scale"]);
    });

  });

  describe("operation names", function() {

    it("are rendered once", function() {
      ctx.lineTo(10, 20);
      ctx.moveTo(30, 40);
      flush();

      expect(getLastPacket()[0]).toEqual(["lineTo", "moveTo"]);
      expect(getLastPacket()[1]).toEqual([0, 1]);
    });

    it("are not rendered again", function() {
      ctx.lineTo(10, 20);
      ctx.moveTo(30, 40);
      flush();
      nativeBridge.resetCalls();

      ctx.lineTo(50, 60);
      ctx.moveTo(70, 80);
      flush();

      expect(getLastPacket()[0]).toEqual([]);
      expect(getLastPacket()[1]).toEqual([0, 1]);
    });

    it("are appended to existing operations", function() {
      ctx.lineTo(10, 20);
      ctx.moveTo(30, 40);
      flush();
      nativeBridge.resetCalls();

      ctx.rect(10, 20, 30, 40);
      flush();

      expect(getLastPacket()[0]).toEqual(["rect"]);
      expect(getLastPacket()[1]).toEqual([2]);
    });

  });

  describe("scale", function() {

    it("is rendered", function() {
      ctx.scale(2, 3);
      flush();

      expect(decodeLastPacket()).toEqual({ops: ["scale"], doubles: [2, 3]});
    });

    it("raises error if parameters missing", function() {
      expect(() => {
        ctx.scale(2);
      }).toThrowError("Not enough arguments to CanvasContext.scale");
    });

  });

  describe("rotate", function() {

    it("is rendered", function() {
      ctx.rotate(3.14);
      flush();

      expect(decodeLastPacket()).toEqual({ops: ["rotate"], doubles: [3.14]});
    });

    it("raises error if parameters missing", function() {
      expect(() => {
        ctx.rotate();
      }).toThrowError("Not enough arguments to CanvasContext.rotate");
    });

  });

  describe("translate", function() {

    it("is rendered", function() {
      ctx.translate(23, 42);
      flush();

      expect(decodeLastPacket()).toEqual({ops: ["translate"], doubles: [23, 42]});
    });

    it("raises error if parameters missing", function() {
      expect(() => {
        ctx.translate(23);
      }).toThrowError("Not enough arguments to CanvasContext.translate");
    });

  });

  describe("transform", function() {

    it("is rendered", function() {
      ctx.transform(1, 2, 3, 4, 5, 6);
      flush();

      expect(decodeLastPacket()).toEqual({ops: ["transform"], doubles: [1, 2, 3, 4, 5, 6]});
    });

    it("raises error if parameters missing", function() {
      expect(() => {
        ctx.transform();
      }).toThrowError("Not enough arguments to CanvasContext.transform");
    });

  });

  describe("setTransform", function() {

    it("is rendered", function() {
      ctx.setTransform(1, 2, 3, 4, 5, 6);
      flush();

      expect(decodeLastPacket()).toEqual({ops: ["setTransform"], doubles: [1, 2, 3, 4, 5, 6]});
    });

    it("raises error if parameters missing", function() {
      expect(() => {
        ctx.setTransform();
      }).toThrowError("Not enough arguments to CanvasContext.setTransform");
    });

  });

  describe("measureText", function() {

    it("is rendered", function() {
      expect(ctx.measureText("foo").width).toBeGreaterThan("foo".length);
    });

  });

  describe("beginPath", function() {

    it("is rendered", function() {
      ctx.beginPath();
      flush();

      expect(decodeLastPacket()).toEqual({ops: ["beginPath"]});
    });

  });

  describe("closePath", function() {

    it("is rendered", function() {
      ctx.closePath();
      flush();

      expect(decodeLastPacket()).toEqual({ops: ["closePath"]});
    });

  });

  describe("lineTo", function() {

    it("is rendered", function() {
      ctx.lineTo(10, 20);
      flush();

      expect(decodeLastPacket()).toEqual({ops: ["lineTo"], doubles: [10, 20]});
    });

    it("raises error if parameters missing", function() {
      expect(() => {
        ctx.lineTo(1);
      }).toThrowError("Not enough arguments to CanvasContext.lineTo");
    });

  });

  describe("moveTo", function() {

    it("is rendered", function() {
      ctx.moveTo(10, 20);
      flush();

      expect(decodeLastPacket()).toEqual({ops: ["moveTo"], doubles: [10, 20]});
    });

    it("raises error if parameters missing", function() {
      expect(() => {
        ctx.moveTo(1);
      }).toThrowError("Not enough arguments to CanvasContext.moveTo");
    });

  });

  describe("bezierCurveTo", function() {

    it("is rendered", function() {
      ctx.bezierCurveTo(1, 2, 3, 4, 5, 6);
      flush();

      expect(decodeLastPacket()).toEqual({ops: ["bezierCurveTo"], doubles: [1, 2, 3, 4, 5, 6]});
    });

    it("raises error if parameters missing", function() {
      expect(() => {
        ctx.bezierCurveTo(1, 2, 3, 4, 5);
      }).toThrowError("Not enough arguments to CanvasContext.bezierCurveTo");
    });

  });

  describe("quadraticCurveTo", function() {

    it("is rendered", function() {
      ctx.quadraticCurveTo(1, 2, 3, 4);
      flush();

      expect(decodeLastPacket()).toEqual({ops: ["quadraticCurveTo"], doubles: [1, 2, 3, 4]});
    });

    it("raises error if parameters missing", function() {
      expect(() => {
        ctx.quadraticCurveTo(1, 2, 3);
      }).toThrowError("Not enough arguments to CanvasContext.quadraticCurveTo");
    });

  });

  describe("arc", function() {

    it("is rendered with counterclockwise default", function() {
      ctx.arc(1, 2, 3, 4, 5);
      flush();

      expect(decodeLastPacket()).toEqual({ops: ["arc"], doubles: [1, 2, 3, 4, 5], booleans: [false]});
    });

    it("is rendered with counterclockwise parameter", function() {
      ctx.arc(1, 2, 3, 4, 5, true);
      flush();

      expect(decodeLastPacket()).toEqual({ops: ["arc"], doubles: [1, 2, 3, 4, 5], booleans: [true]});
    });

    it("raises error if parameters missing", function() {
      expect(() => {
        ctx.arc(1, 2, 3, 4);
      }).toThrowError("Not enough arguments to CanvasContext.arc");
    });

  });

  describe("rect", function() {

    it("is rendered", function() {
      ctx.rect(1, 2, 3, 4);
      flush();

      expect(decodeLastPacket()).toEqual({ops: ["rect"], doubles: [1, 2, 3, 4]});
    });

    it("raises error if parameters missing", function() {
      expect(() => {
        ctx.rect(1, 2, 3);
      }).toThrowError("Not enough arguments to CanvasContext.rect");
    });

  });

  describe("fill", function() {

    it("is rendered", function() {
      ctx.fill();
      flush();

      expect(decodeLastPacket()).toEqual({ops: ["fill"]});
    });

  });

  describe("stroke", function() {

    it("is rendered", function() {
      ctx.stroke();
      flush();

      expect(decodeLastPacket()).toEqual({ops: ["stroke"]});
    });

  });

  describe("clearRect", function() {

    it("is rendered", function() {
      ctx.clearRect(10, 20, 30, 40);
      flush();

      expect(decodeLastPacket()).toEqual({ops: ["clearRect"], doubles: [10, 20, 30, 40]});
    });

    it("raises error if parameters missing", function() {
      expect(() => {
        ctx.clearRect(1, 2, 3);
      }).toThrowError("Not enough arguments to CanvasContext.clearRect");
    });

  });

  describe("fillRect", function() {

    it("is rendered", function() {
      ctx.fillRect(10, 20, 30, 40);
      flush();

      expect(decodeLastPacket()).toEqual({
        ops: ["beginPath", "rect", "fill"],
        doubles: [10, 20, 30, 40]
      });
    });

    it("raises error if parameters missing", function() {
      expect(() => {
        ctx.fillRect(1, 2, 3);
      }).toThrowError("Not enough arguments to CanvasContext.fillRect");
    });

  });

  describe("strokeRect", function() {

    it("is rendered", function() {
      ctx.strokeRect(10, 20, 30, 40);
      flush();

      expect(decodeLastPacket()).toEqual({
        ops: ["beginPath", "rect", "stroke"],
        doubles: [10, 20, 30, 40]
      });
    });

    it("raises error if parameters missing", function() {
      expect(() => {
        ctx.strokeRect(1, 2, 3);
      }).toThrowError("Not enough arguments to CanvasContext.strokeRect");
    });

  });

  describe("fillText", function() {

    it("is rendered", function() {
      ctx.fillText("foo", 10, 20);
      flush();

      expect(decodeLastPacket()).toEqual({
        ops: ["fillText"],
        doubles: [10, 20],
        booleans: [false, false, false],
        strings: ["foo"]
      });
    });

    it("raises error if parameters missing", function() {
      expect(() => {
        ctx.fillText("foo", 2);
      }).toThrowError("Not enough arguments to CanvasContext.fillText");
    });

  });

  describe("strokeText", function() {

    it("is rendered", function() {
      ctx.strokeText("foo", 10, 20);
      flush();

      expect(decodeLastPacket()).toEqual({
        ops: ["strokeText"],
        doubles: [10, 20],
        booleans: [false, false, false],
        strings: ["foo"]
      });
    });

    it("raises error if parameters missing", function() {
      expect(() => {
        ctx.strokeText("foo", 2);
      }).toThrowError("Not enough arguments to CanvasContext.strokeText");
    });

  });

  describe("createImageData", function() {

    it("creates ImageData from width and height", function() {
      var result = ctx.createImageData(10, 20);

      expect(result).toEqual(jasmine.any(tabris.ImageData));
      expect(result.width).toBe(10);
      expect(result.height).toBe(20);
    });

    it("creates ImageData from ImageData", function() {
      var array = new Uint8ClampedArray(60).fill(128);
      var input = new tabris.ImageData(array, 3, 5);

      var result = ctx.createImageData(input);

      expect(result).toEqual(jasmine.any(tabris.ImageData));
      expect(result.width).toBe(3);
      expect(result.height).toBe(5);
      expect(result.data[0]).toBe(0);
    });

    it("raises error if parameters missing", function() {
      expect(function() {
        ctx.createImageData(10);
      }).toThrowError("Not enough arguments to CanvasContext.createImageData");
    });

  });

  describe("getImageData", function() {

    var array;

    beforeEach(function() {
      array = new Uint8ClampedArray(60);
      spyOn(nativeBridge, "call").and.returnValue(array);
    });

    it("is rendered", function() {
      ctx.getImageData(10, 20, 5, 3);

      expect(nativeBridge.call).toHaveBeenCalledWith(gc.cid, "getImageData", {
        x: 10,
        y: 20,
        width: 5,
        height: 3
      });
    });

    it("returns value from native", function() {
      var result = ctx.getImageData(10, 20, 5, 3);

      expect(result.data).toEqual(array);
    });

    it("raises error if parameters missing", function() {
      expect(function() {
        ctx.getImageData(10, 20, 100);
      }).toThrowError("Not enough arguments to CanvasContext.getImageData");
    });

  });

  describe("putImageData", function() {

    var imageData;

    beforeEach(function() {
      imageData = new tabris.ImageData(3, 5);
      spyOn(nativeBridge, "call");
    });

    it("is rendered", function() {
      ctx.putImageData(imageData, 10, 20);

      expect(nativeBridge.call).toHaveBeenCalledWith(gc.cid, "putImageData", {
        data: imageData.data,
        x: 10,
        y: 20,
        width: 3,
        height: 5
      });
    });

    it("raises error if parameters missing", function() {
      expect(() => {
        ctx.putImageData(imageData, 10);
      }).toThrowError("Not enough arguments to CanvasContext.putImageData");
    });

  });

});
